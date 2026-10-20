import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { extractClassNames, generate, renderDts } from './gen-scss-dts.mjs';

describe('extractClassNames', () => {
  it('extracts class selectors only', () => {
    const css = `
      /* .commented { } */
      .a, .b:hover > .c-d { font-size: 1.6rem; margin: .5em; }
      @media (max-width: 600px) { .e_f { background: url(img.png); } }
      div.g::before { content: ".notclass"; }
    `;
    expect(extractClassNames(css)).toEqual(['a', 'b', 'c-d', 'e_f', 'g']);
  });

  it('returns unique names', () => {
    expect(extractClassNames('.a{} .a .b{}')).toEqual(['a', 'b']);
  });

  it('handles several rules inside one media query', () => {
    expect(
      extractClassNames('@media (min-width: 1px) { .a { x: 1 } .b { y: 2 } }')
    ).toEqual(['a', 'b']);
  });

  it('includes classes inside :not()', () => {
    expect(extractClassNames('.a:not(.b) { x: 1 }')).toEqual(['a', 'b']);
  });

  it('ignores :global() classes and attribute values', () => {
    expect(
      extractClassNames(':global(.g) .a { x: 1 } [data-x=a.b] .c { y: 2 }')
    ).toEqual(['a', 'c']);
  });
});

describe('renderDts', () => {
  it('renders a default-export only declaration', () => {
    const dts = renderDts(['x']);
    expect(dts).toContain("  'x': string;");
    expect(dts).toContain('export default cssExports;');
    expect(dts).not.toContain('export const');
  });
});

describe('generate', () => {
  let dir;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gen-scss-dts-'));
  });
  afterEach(() => {
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('writes d.ts for module scss using @use, and removes stale d.ts', async () => {
    fs.mkdirSync(path.join(dir, 'c'));
    fs.writeFileSync(path.join(dir, '_vars.scss'), '$c: #fff;');
    fs.writeFileSync(
      path.join(dir, 'c', 'style.module.scss'),
      '@use "../vars"; .item { color: vars.$c; .title { x: 1 } }'
    );
    fs.writeFileSync(path.join(dir, 'global.scss'), '.global { x: 1 }');
    const stale = path.join(dir, 'c', 'removed.module.scss.d.ts');
    fs.writeFileSync(stale, '');

    await generate(dir);

    const out = path.join(dir, 'c', 'style.module.scss.d.ts');
    expect(fs.readFileSync(out, 'utf8')).toBe(renderDts(['item', 'title']));
    expect(fs.existsSync(path.join(dir, 'global.scss.d.ts'))).toBe(false);
    expect(fs.existsSync(stale)).toBe(false);
  });

  it('does not rewrite an up-to-date d.ts', async () => {
    const src = path.join(dir, 'a.module.scss');
    fs.writeFileSync(src, '.a { x: 1 }');
    await generate(dir);
    const out = src + '.d.ts';
    const past = new Date(2000, 0, 1);
    fs.utimesSync(out, past, past);
    await generate(dir);
    expect(fs.statSync(out).mtime.getTime()).toBe(past.getTime());
  });
});
