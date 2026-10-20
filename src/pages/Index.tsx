import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import '../style/page.scss';
import Styles from './style.module.scss';
import { RootState } from '../stores';
import { CodeLibArticle } from '../lib/CodeLib/types';
import * as CodeLibActions from '../stores/codelib/actions';
import CodeLib from '../lib/CodeLib';
import SideSearchFrame from '../containers/SideSearchFrame/';
import CodeLibArticleViewer from '../components/CodeLibArticleViewer';
import { Routes, Route } from 'react-router';
import TopContentFrame from '../containers/TopContentFrame';
import FetchCodeLib from '../containers/FetchCodeLib';
import Header from '../components/Header';

//

type Props = Record<string, never>;

type State = Record<string, never>;

//

type StateProps = {
  codeLibArticles: Array<CodeLibArticle>;
};

type DispatchProps = {
  onFetchCodeLibData: (items: Array<CodeLibArticle>) => void;
};

type CombinedProps = Props & StateProps & DispatchProps;

//

function mapStateToProps(state: RootState): StateProps {
  return {
    codeLibArticles: state.codeLib.items,
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    onFetchCodeLibData: (items: Array<CodeLibArticle>) =>
      dispatch(CodeLibActions.setItems(items)),
  };
}

//

class Index extends React.Component<CombinedProps, State> {
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
    return (
      <div className={Styles.bodyWrapper}>
        <FetchCodeLib />
        <div className={Styles.layoutTopFrame}>
          <Header />
        </div>
        <div className={Styles.layoutFullFrame}>
          <div className={Styles.layoutMainPageFrame}>
            <Routes>
              {this.props.codeLibArticles.map((a) => (
                <Route
                  path={`${a.path}.html`}
                  key={a.path}
                  element={<CodeLibArticleViewer article={a} />}
                />
              ))}
              <Route path="*" element={<TopContentFrame />} />
            </Routes>
          </div>
          <div className={Styles.layoutSideSearchFrame}>
            <SideSearchFrame />
          </div>
        </div>
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, Props, RootState>(
  mapStateToProps,
  mapDispatchToProps
)(Index);
