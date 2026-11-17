import React, { ChangeEvent } from 'react';
import { connect } from 'react-redux';
import { AppDispatch, RootState } from '../../stores';
import { CodeLibArticleSummary } from '../../lib/CodeLib/types';
import * as SearchBoxActions from '../../stores/searchbox/actions';
import { selectFilteredArticles } from '../../stores/selectors';
import { articleUrl } from '../../lib/CodeLib/url';
import SnippetListItem from '../../components/SnippetListItem';
import SnippetList from '../../components/SnippetList';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';
import Style from './style.module.scss';
import { LanguageOption, selectLanguageOptions } from './impl';

//

type Props = Record<string, never>;

type State = Record<string, never>;

//

type StateProps = {
  codeLibArticles: Array<CodeLibArticleSummary>;
  languageOptions: Array<LanguageOption>;
  searchBoxKeyword: string;
  searchBoxLang: string;
};

type DispatchProps = {
  onChangeSearchBoxKeyword: (keyword: string) => void;
  onChangeSearchBoxLang: (lang: string) => void;
};

type CombinedProps = Props & StateProps & DispatchProps;

//

function mapStateToProps(state: RootState): StateProps {
  return {
    codeLibArticles: selectFilteredArticles(state),
    languageOptions: selectLanguageOptions(state),
    searchBoxKeyword: state.searchBox.keyword,
    searchBoxLang: state.searchBox.lang,
  };
}

function mapDispatchToProps(dispatch: AppDispatch): DispatchProps {
  return {
    onChangeSearchBoxKeyword: (keyword: string) =>
      dispatch(SearchBoxActions.updateKeyword(keyword)),
    onChangeSearchBoxLang: (lang: string) =>
      dispatch(SearchBoxActions.updateLang(lang)),
  };
}

//

class SideSearchFrame extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    this.state = {};

    this.handleChangeSearchBoxKeyword =
      this.handleChangeSearchBoxKeyword.bind(this);
    this.handleChangeSearchBoxLang = this.handleChangeSearchBoxLang.bind(this);
  }

  handleChangeSearchBoxKeyword(e: ChangeEvent<HTMLInputElement>) {
    this.props.onChangeSearchBoxKeyword(e.target.value);
  }

  handleChangeSearchBoxLang(e: ChangeEvent<HTMLSelectElement>) {
    this.props.onChangeSearchBoxLang(e.target.value);
  }

  render(): JSX.Element {
    // 外枠は layoutSideSearchFrame で column 方向の flex と overflow: hidden を定義
    // column はできればここに書きたいが、flexなdivブロックがもう１重必要になる
    return (
      <>
        <div className={Style.searchBar}>
          <div className={Style.keywordBox}>
            <TextInput
              className={Style.searchInput}
              placeholder="キーワード検索"
              value={this.props.searchBoxKeyword}
              onChange={this.handleChangeSearchBoxKeyword}
            />
          </div>
          <div className={Style.langBox}>
            <Select
              className={Style.searchInput}
              value={this.props.searchBoxLang}
              onChange={this.handleChangeSearchBoxLang}
              options={this.props.languageOptions}
            />
          </div>
        </div>
        <div className={Style.articleList}>
          <SnippetList>
            {this.props.codeLibArticles.map((item) => (
              <SnippetListItem
                article={item}
                linkto={articleUrl(item.path)}
                key={item.path}
              />
            ))}
          </SnippetList>
        </div>
      </>
    );
  }
}

export default connect<StateProps, DispatchProps, Props, RootState>(
  mapStateToProps,
  mapDispatchToProps
)(SideSearchFrame);
