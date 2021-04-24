import React, { ChangeEvent } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import '../../style/style-screen.scss';
import { RootState } from '../../stores';
import { CodeLibArticle } from '../../lib/CodeLib/types';
import * as SearchBoxActions from '../../stores/searchbox/actions';
import * as Impl from './impl';
import SnippetListItem from '../../components/SnippetListItem';
import SnippetList from '../../components/SnippetList';
import TextInput from '../../components/TextInput';
import Header from '../../components/Header';

//

type Props = {};

type State = {};

//

type StateProps = {
  codeLibArticles: Array<CodeLibArticle>;
  searchBoxKeyword: string;
};

type DispatchProps = {
  onChangeSearchBoxKeyword: (keyword: string) => void;
};

type CombinedProps = Props & StateProps & DispatchProps;

//

function mapStateToProps(state: RootState): StateProps {
  return {
    codeLibArticles: Impl.filterCodeLibArticles(
      state.codeLib.items,
      state.searchBox.keyword
    ).sort((l, r) => l.path.localeCompare(r.path)),
    searchBoxKeyword: state.searchBox.keyword,
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    onChangeSearchBoxKeyword: (keyword: string) =>
      dispatch(SearchBoxActions.updateKeyword(keyword)),
  };
}

//

class SideSearchFrame extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    this.state = {};

    this.handleChangeSearchBoxKeyword = this.handleChangeSearchBoxKeyword.bind(
      this
    );
  }

  handleChangeSearchBoxKeyword(e: ChangeEvent<HTMLInputElement>) {
    this.props.onChangeSearchBoxKeyword(e.target.value);
  }

  render(): JSX.Element {
    return (
      <div
        className="fixedFlex cols nooverflow"
        style={{ width: '320px', resize: 'horizontal' }}
      >
        <Header />
        <div className="fixedFlex">
          <TextInput
            placeholder="キーワード検索"
            value={this.props.searchBoxKeyword}
            onChange={this.handleChangeSearchBoxKeyword}
          />
        </div>
        <div className="flex nooverflow scrollableY">
          <SnippetList>
            {this.props.codeLibArticles
              ? this.props.codeLibArticles.map((item) => (
                  <SnippetListItem
                    article={item}
                    linkto={`${item.path}.html`}
                    key={item.path}
                  />
                ))
              : null}
          </SnippetList>
        </div>
      </div>
    );
  }
}

export default connect<StateProps, DispatchProps, Props, RootState>(
  mapStateToProps,
  mapDispatchToProps
)(SideSearchFrame);
