import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import '../style/style-screen.scss';
import { RootState } from '../stores';
import { CodeLibArticle } from '../lib/CodeLib/types';
import * as CodeLibActions from '../stores/codelib/actions';
import CodeLib from '../lib/CodeLib';
import SideSearchFrame from '../containers/SideSearchFrame/';
import CodeLibArticleViewer from '../components/CodeLibArticleViewer';

//

type Props = {
}

type State = {
  visibleArticle: CodeLibArticle | null,  // TODO: 疲れたので適当 全ての状態をRedux化すべきだろうか？
}

//

type StateProps = {
  codeLibArticles: Array<CodeLibArticle>
}

type DispatchProps = {
  onFetchCodeLibData: (items: Array<CodeLibArticle>) => void
}

type CombinedProps = Props & StateProps & DispatchProps;

//

function mapStateToProps(state: RootState): StateProps {
  return {
    codeLibArticles: state.codeLib.items
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    onFetchCodeLibData: (items: Array<CodeLibArticle>) => dispatch(CodeLibActions.setItems(items))
  };
}

//

class Index extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    this.state = { visibleArticle: null };
  }

  componentDidMount(): void {
    (async () => {
      const items = await CodeLib.fetchAll();
      this.props.onFetchCodeLibData(items);
    })();
  }

  // componentWillUnmount(): void  // for unscribe

  render(): JSX.Element {
    return (
      <div id='bodywrapper' className='cols'>
        <div className='flex row nooverflow' >
          {/* TODO: 疲れたので適当 */}
          <SideSearchFrame onSelectArticle={(p) => { this.setState(Object.assign({}, this.state, { visibleArticle: this.props.codeLibArticles.find(a => a.path == p) })); }} />
          <div className='flex scrollableY'>
            {this.state.visibleArticle ? <CodeLibArticleViewer article={this.state.visibleArticle} /> : 'おもち'}
          </div>
        </div>
      </div >
    );
  }
}

export default connect<StateProps, DispatchProps, Props, RootState>(mapStateToProps, mapDispatchToProps)(Index);
