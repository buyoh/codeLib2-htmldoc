import React from 'react';
import ArticleViewFrame from '../ArticleViewerFrame';

type Props = {
  // トップページへの導線（ルータ外では <a>、ルータ内では <Link> を渡す）
  children?: React.ReactNode;
};

type State = Record<string, never>;

class RenderErrorMessage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <ArticleViewFrame>
        <h1>表示に失敗しました</h1>
        <p>ページの表示中にエラーが発生しました。</p>
        <p>{this.props.children}</p>
      </ArticleViewFrame>
    );
  }
}

export default RenderErrorMessage;
