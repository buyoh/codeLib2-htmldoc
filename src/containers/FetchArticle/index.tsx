import React, { useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import { useLocation } from 'react-router';
import { AppDispatch, RootState } from '../../stores';
import * as CodeLibActions from '../../stores/codelib/actions';
import { selectArticlePaths } from '../../stores/selectors';
import { articlePathFromUrl } from '../../lib/CodeLib/url';
import CodeLib from '../../lib/CodeLib';

// 結果は要求した path のキーに保存するので、遷移後に届いても破棄しない
async function load(dispatch: AppDispatch, path: string): Promise<void> {
  dispatch(CodeLibActions.articleFetchStarted(path));
  try {
    const article = await CodeLib.fetchArticle(path);
    dispatch(CodeLibActions.articleFetchSucceeded(article));
  } catch (e) {
    console.error(e);
    dispatch(
      CodeLibActions.articleFetchFailed({
        path,
        error: e instanceof Error ? e.message : String(e),
      })
    );
  }
}

// 表示中の記事 URL に対応する記事の JSON を読み込む。何も描画しない。
// インデックスに存在する path のみ取得する（URL 由来の未検証の値で fetch しない）
function FetchArticle(): JSX.Element {
  const { pathname } = useLocation();
  const path = articlePathFromUrl(pathname);
  const paths = useSelector(selectArticlePaths);
  const exists = path !== null && paths.has(path);
  const store = useStore<RootState>();

  useEffect(() => {
    if (path === null || !exists) return;
    // 読み込み中・取得済みなら取得しない（StrictMode の二重実行を含む）
    if (store.getState().codeLib.articles[path] === undefined)
      void load(store.dispatch, path);
    // 離れるときに失敗を消し、戻ったときに再取得する。
    // 依存配列に記事の状態を含めると、失敗のたびに再取得が続くので含めない
    return () => {
      store.dispatch(CodeLibActions.articleFetchErrorCleared(path));
    };
  }, [path, exists, store]);

  return <></>;
}

export default FetchArticle;
