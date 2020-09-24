import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import Header from '../components/Header';
import Navigator from '../components/Navigator';
import SnippetSummary from '../components/SnippetSummary';
import SnippetSummaryList from '../components/SnippetSummaryList';
import '../style/style.scss';
import { RootState } from '../stores';
import { CodeLibItem } from '../lib/CodeLib/types';
import * as CodeLibActions from '../stores/codelib/actions';
import CodeLib from '../lib/CodeLib';

//

type Props = {
}

type State = {
}

//

type StateProps = {
  codeLibItems: Array<CodeLibItem>
}

type DispatchProps = {
  onFetchCodeLibData: (items: Array<CodeLibItem>) => void
}

type CombinedProps = Props & StateProps & DispatchProps;

//

function mapStateToProps(state: RootState): StateProps {
  return {
    codeLibItems: state.codeLib.items
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    onFetchCodeLibData: (items: Array<CodeLibItem>) => dispatch(CodeLibActions.addItems(items))
  };
}

//

class Index extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    console.log(this.state);
    this.state = {};
  }

  componentDidMount(): void {
    console.log('componentDidMount');
    (async () => {
      console.log('fetch start');
      const items = await CodeLib.fetchAll();
      this.props.onFetchCodeLibData(items);
    })();
  }

  // componentWillUnmount(): void  // for unscribe

  render(): JSX.Element {
    return (
      <div id='bodywrapper'>
        <Header />
        <Navigator />
        <div id='main'>
          <h1>一覧</h1>
          <SnippetSummaryList>
            {this.props.codeLibItems ? this.props.codeLibItems.map(item => (
              <SnippetSummary title={item.title} path={item.path} keywords={item.words || []} date='2020/01/01' key={item.path} />
            )) : null}
          </SnippetSummaryList>
        </div>
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, Props, RootState>(mapStateToProps, mapDispatchToProps)(Index);
