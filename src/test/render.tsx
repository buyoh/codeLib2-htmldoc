import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export type RenderResult = {
  container: HTMLElement;
  rerender: (element: React.ReactElement) => void;
  unmount: () => void;
};

// jsdom 環境で要素を描画する
export function render(element: React.ReactElement): RenderResult {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let root: Root | null = null;
  act(() => {
    root = createRoot(container);
    root.render(element);
  });
  return {
    container,
    rerender: (next) => act(() => root?.render(next)),
    unmount: () => {
      act(() => root?.unmount());
      container.remove();
    },
  };
}

// 意図的な描画例外のログ（React の console.error と jsdom の error イベント）を抑制する
export function suppressRenderErrorLogs(): () => void {
  const preventDefault = (e: ErrorEvent) => e.preventDefault();
  const original = console.error;
  console.error = () => undefined;
  window.addEventListener('error', preventDefault);
  return () => {
    console.error = original;
    window.removeEventListener('error', preventDefault);
  };
}
