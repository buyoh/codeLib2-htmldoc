import React from 'react';
import { connect } from 'react-redux';
import { AppDispatch, RootState } from '../../stores';
import { CodeLibArticle } from '../../lib/CodeLib/types';
import * as CodeLibActions from '../../stores/codelib/actions';
import CodeLib from '../../lib/CodeLib';

//

type Props = object; // Empty.

type State = Record<string, never>;

//

type DispatchProps = {
  onFetchStarted: () => void;
  onFetchSucceeded: (items: Array<CodeLibArticle>) => void;
  onFetchFailed: (error: string) => void;
};

type CombinedProps = Props & DispatchProps;

//

function mapDispatchToProps(dispatch: AppDispatch): DispatchProps {
  return {
    onFetchStarted: () => dispatch(CodeLibActions.fetchStarted()),
    onFetchSucceeded: (items: Array<CodeLibArticle>) =>
      dispatch(CodeLibActions.fetchSucceeded(items)),
    onFetchFailed: (error: string) =>
      dispatch(CodeLibActions.fetchFailed(error)),
  };
}

//

export class FetchCodeLib extends React.Component<CombinedProps, State> {
  // 最新の取得要求の番号。古い要求や unmount 後の結果は破棄する
  private requestId = 0;

  constructor(props: CombinedProps) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    this.load();
  }

  componentWillUnmount(): void {
    this.requestId++;
  }

  private async load(): Promise<void> {
    const requestId = ++this.requestId;
    this.props.onFetchStarted();
    try {
      const items = await CodeLib.fetchAll();
      if (requestId !== this.requestId) return;
      this.props.onFetchSucceeded(items);
    } catch (e) {
      if (requestId !== this.requestId) return;
      console.error(e);
      this.props.onFetchFailed(e instanceof Error ? e.message : String(e));
    }
  }

  render(): JSX.Element {
    return <></>;
  }
}

export default connect<object, DispatchProps, Props, RootState>(
  null,
  mapDispatchToProps
)(FetchCodeLib);
