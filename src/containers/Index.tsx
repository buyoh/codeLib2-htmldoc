import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import Header from '../components/Header';
import Navigator from '../components/Navigator';
import SnippetSummary from '../components/SnippetSummary';
import SnippetSummaryList from '../components/SnippetSummaryList';
import { CodeLibItem } from '../stores/codelib/types';
import '../style/style.scss';
import { RootState } from '../stores';

type Props = {
}

type State = {
}


type StateProps = {
  codeLibItems: Array<CodeLibItem>
}

type DispatchProps = {

}

type CombinedProps = Props & StateProps & DispatchProps;


function mapStateToProps(state: RootState): StateProps {
  return {
    codeLibItems: state.codeLib.items
  };
}

function mapDispatchToProps(_dispatch: Dispatch): DispatchProps {
  return {
  };
}

class Index extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    console.log(this.state);
    this.state = {};
  }
  render(): JSX.Element {
    console.log(this.state);
    console.log(this.props);
    return (
      <div id='bodywrapper'>
        <Header />
        <Navigator />
        <div id='main'>
          <h1>一覧</h1>
          <SnippetSummaryList>
            {this.props.codeLibItems ? this.props.codeLibItems.map(item => (
              <SnippetSummary title={item.title} path={item.path} keywords={item.words} date='2020/01/01' key={item.path} />
            )) : null}

          </SnippetSummaryList>
        </div>
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, Props, RootState>(mapStateToProps, mapDispatchToProps)(Index);
