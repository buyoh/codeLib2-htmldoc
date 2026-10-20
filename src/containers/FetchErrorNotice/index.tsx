import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../stores';
import FetchErrorMessage from '../../components/FetchErrorMessage';

// 記事データの取得に失敗したときのみ通知を表示する
function FetchErrorNotice(): JSX.Element | null {
  const status = useSelector((state: RootState) => state.codeLib.status);
  const error = useSelector((state: RootState) => state.codeLib.error);
  if (status !== 'error') return null;
  return <FetchErrorMessage error={error ?? 'unknown error'} />;
}

export default FetchErrorNotice;
