// @vitest-environment jsdom
import React from 'react';
import { describe, expect, it } from 'vitest';
import Select from '.';
import { render } from '../../test/render';

const noop = () => undefined;

describe('Select', () => {
  it('has no layout class of its own', () => {
    const r = render(<Select value="" options={[]} onChange={noop} />);
    expect(r.container.querySelector('select')?.classList.length).toBe(1);
    r.unmount();
  });

  it('adds the className given by the caller', () => {
    const r = render(
      <Select value="" options={[]} onChange={noop} className="layout" />
    );
    const select = r.container.querySelector('select');
    expect(select?.classList.contains('layout')).toBe(true);
    expect(select?.classList.length).toBe(2);
    r.unmount();
  });
});
