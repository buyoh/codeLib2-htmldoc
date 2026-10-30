// @vitest-environment jsdom
import React from 'react';
import { describe, expect, it } from 'vitest';
import TextInput from '.';
import { render } from '../../test/render';

const noop = () => undefined;

describe('TextInput', () => {
  it('has no layout class of its own', () => {
    const r = render(<TextInput value="" onChange={noop} />);
    expect(r.container.querySelector('input')?.classList.length).toBe(1);
    r.unmount();
  });

  it('adds the className given by the caller', () => {
    const r = render(<TextInput value="" onChange={noop} className="layout" />);
    const input = r.container.querySelector('input');
    expect(input?.classList.contains('layout')).toBe(true);
    expect(input?.classList.length).toBe(2);
    r.unmount();
  });
});
