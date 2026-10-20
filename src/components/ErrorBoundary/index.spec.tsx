// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ErrorBoundary from '.';
import { render, suppressRenderErrorLogs } from '../../test/render';

function Thrower({ fail }: { fail: boolean }): JSX.Element {
  if (fail) throw Error('render failed');
  return <span>ok</span>;
}

describe('ErrorBoundary', () => {
  let restoreLogs: () => void;
  beforeEach(() => {
    restoreLogs = suppressRenderErrorLogs();
  });
  afterEach(() => {
    restoreLogs();
  });

  it('renders children when nothing throws', () => {
    const r = render(
      <ErrorBoundary fallback={<span>fallback</span>}>
        <Thrower fail={false} />
      </ErrorBoundary>
    );
    expect(r.container.textContent).toBe('ok');
    r.unmount();
  });

  it('renders the fallback when a child throws', () => {
    const r = render(
      <ErrorBoundary fallback={<span>fallback</span>}>
        <Thrower fail={true} />
      </ErrorBoundary>
    );
    expect(r.container.textContent).toBe('fallback');
    r.unmount();
  });

  it('keeps the fallback until remounted with a new key', () => {
    const r = render(
      <ErrorBoundary key="a" fallback={<span>fallback</span>}>
        <Thrower fail={true} />
      </ErrorBoundary>
    );
    r.rerender(
      <ErrorBoundary key="a" fallback={<span>fallback</span>}>
        <Thrower fail={false} />
      </ErrorBoundary>
    );
    expect(r.container.textContent).toBe('fallback');
    r.rerender(
      <ErrorBoundary key="b" fallback={<span>fallback</span>}>
        <Thrower fail={false} />
      </ErrorBoundary>
    );
    expect(r.container.textContent).toBe('ok');
    r.unmount();
  });
});
