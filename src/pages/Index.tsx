import React from 'react';
import '../style/page.scss';
import Styles from './style.module.scss';
import SideSearchFrame from '../containers/SideSearchFrame/';
import { Routes, Route } from 'react-router';
import ArticleRoute from '../containers/ArticleRoute';
import FetchCodeLib from '../containers/FetchCodeLib';
import FetchErrorNotice from '../containers/FetchErrorNotice';
import Header from '../components/Header';

//

type Props = Record<string, never>;

type State = Record<string, never>;

//

class Index extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render(): JSX.Element {
    return (
      <div className={Styles.bodyWrapper}>
        <FetchCodeLib />
        <div className={Styles.layoutTopFrame}>
          <Header />
        </div>
        <div className={Styles.layoutFullFrame}>
          <div className={Styles.layoutMainPageFrame}>
            <FetchErrorNotice />
            <Routes>
              <Route path="*" element={<ArticleRoute />} />
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

export default Index;
