import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import { RootState } from '../../stores';
import { selectArticleMap } from '../../stores/selectors';
import CodeLibArticleViewer from '../../components/CodeLibArticleViewer';
import ErrorBoundary from '../../components/ErrorBoundary';
import NotFound from '../../components/NotFound';
import RenderErrorMessage from '../../components/RenderErrorMessage';
import TopContentFrame from '../TopContentFrame';
import { ArticleView, resolveArticleView } from './impl';

function renderView(view: ArticleView): JSX.Element | null {
  switch (view.kind) {
    case 'top':
      return <TopContentFrame />;
    case 'article':
      return <CodeLibArticleViewer article={view.article} />;
    case 'notFound':
      return <NotFound />;
    case 'pending':
      return null;
  }
}

// pathname に対応する記事（またはトップ / NotFound）を表示する
function ArticleRoute(): JSX.Element {
  const { pathname } = useLocation();
  const status = useSelector((state: RootState) => state.codeLib.status);
  const articleMap = useSelector(selectArticleMap);
  const view = resolveArticleView(pathname, status, articleMap);
  return (
    // 遷移時にエラー状態をリセットするため pathname を key にする
    <ErrorBoundary
      key={pathname}
      fallback={
        <RenderErrorMessage>
          <Link to="/">トップへ戻る</Link>
        </RenderErrorMessage>
      }
    >
      {renderView(view)}
    </ErrorBoundary>
  );
}

export default ArticleRoute;
