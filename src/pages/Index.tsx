import React from 'react';
import Header from '../components/Header/';
import Navigator from '../components/Navigator/';
import SnippetSummary from '../components/SnippetSummary/';
import SnippetSummaryList from '../components/SnippetSummaryList/';
import './../style/style.scss';

function Index(): JSX.Element {
  return (
    <div id='bodywrapper'>
      <Header />
      <Navigator />
      <div id='main'>
        <h1>一覧</h1>
        <SnippetSummaryList>
          <SnippetSummary title='タイトル' path='/path/to/hoge.hpp' keywords={[]} date='2020/01/01' />
        </SnippetSummaryList>
      </div>
    </div>
  );
}
Index.displayName = 'Meta';
export default Index;
