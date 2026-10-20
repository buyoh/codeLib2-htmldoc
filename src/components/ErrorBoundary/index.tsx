import React from 'react';

type Props = {
  // 子の描画で例外が発生したときに代わりに表示する要素
  fallback: React.ReactNode;
  children?: React.ReactNode;
};

type State = {
  hasError: boolean;
};

// 子孫の描画例外を捕捉し、fallback を表示する。
// 状態をリセットするには key を変えて再マウントする。
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render(): React.ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export default ErrorBoundary;
