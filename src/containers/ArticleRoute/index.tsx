import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router';
import { RootState } from '../../stores';
import { selectArticlePaths } from '../../stores/selectors';
import CodeLibArticleViewer from '../../components/CodeLibArticleViewer';
import ErrorBoundary from '../../components/ErrorBoundary';
import FetchErrorMessage from '../../components/FetchErrorMessage';
import NotFound from '../../components/NotFound';
import RenderErrorMessage from '../../components/RenderErrorMessage';
import TopContentFrame from '../TopContentFrame';
import { ArticleView, resolveArticleView } from './impl';

function renderView(view: ArticleView): JSX.Element | null {
  switch (view.kind) {
    case 'top':
      return <TopContentFrame />;
    case 'article':
      return (
        <CodeLibArticleViewer
          article={view.article}
          origin={window.location.origin}
        />
      );
    case 'articleError':
      return <FetchErrorMessage error={view.error} />;
    case 'notFound':
      return <NotFound />;
    case 'pending':
      return null;
  }
}

// pathname に対応する記事（またはトップ / NotFound）を表示する。
// 読み込み中（pending）は画面を書き換えず、直前に確定した表示を残す
function ArticleRoute(): JSX.Element {
  const { pathname } = useLocation();
  const status = useSelector((state: RootState) => state.codeLib.status);
  const articlePaths = useSelector(selectArticlePaths);
  const articles = useSelector((state: RootState) => state.codeLib.articles);
  // 参照を保つ。毎回新しいオブジェクトになると下の setSettled が止まらない
  const view = useMemo(
    () => resolveArticleView(pathname, status, articlePaths, articles),
    [pathname, status, articlePaths, articles]
  );
  const [settled, setSettled] = useState({ pathname, view });
  if (view.kind !== 'pending' && view !== settled.view)
    setSettled({ pathname, view });
  const shown = view.kind === 'pending' ? settled : { pathname, view };
  return (
    // 遷移時にエラー状態をリセットするため、表示中の pathname を key にする。
    // pathname のままでは、読み込み中に残している記事が remount される
    <ErrorBoundary
      key={shown.pathname}
      fallback={
        <RenderErrorMessage>
          <Link to="/">トップへ戻る</Link>
        </RenderErrorMessage>
      }
    >
      {renderView(shown.view)}
    </ErrorBoundary>
  );
}

export default ArticleRoute;
