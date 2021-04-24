import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { RootState } from '../../stores';
import { CodeLibArticle } from '../../lib/CodeLib/types';
import * as CodeLibActions from '../../stores/codelib/actions';
import CodeLib from '../../lib/CodeLib';

//

type Props = {};

type State = {};

//

type StateProps = {
  codeLibItems: CodeLibArticle[];
};

type DispatchProps = {
  onFetchCodeLibData: (items: Array<CodeLibArticle>) => void;
};

type CombinedProps = Props & StateProps & DispatchProps;

//

function mapStateToProps(state: RootState): StateProps {
  return {
    codeLibItems: state.codeLib.items,
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    onFetchCodeLibData: (items: Array<CodeLibArticle>) =>
      dispatch(CodeLibActions.setItems(items)),
  };
}

//

class FetchCodeLib extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    this.state = {};
  }

  componentDidMount(): void {
    (async () => {
      const items = await CodeLib.fetchAll();
      this.props.onFetchCodeLibData(items);
    })();
  }

  // componentWillUnmount(): void  // for unscribe

  render(): JSX.Element {
    return <></>;
  }
}

export default connect<StateProps, DispatchProps, Props, RootState>(
  mapStateToProps,
  mapDispatchToProps
)(FetchCodeLib);
