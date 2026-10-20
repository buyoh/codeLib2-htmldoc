import React from 'react';
import { Link } from 'react-router';
import ArticleViewFrame from '../ArticleViewerFrame';

type Props = Record<string, never>;

type State = Record<string, never>;

class NotFound extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <ArticleViewFrame>
        <h1>ページが見つかりません</h1>
        <p>指定された記事は存在しません。</p>
        <p>
          <Link to="/">トップへ戻る</Link>
        </p>
      </ArticleViewFrame>
    );
  }
}

export default NotFound;
