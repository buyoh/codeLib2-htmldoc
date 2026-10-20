import React, { ChangeEvent } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import '../../style/page.scss';
import { RootState } from '../../stores';
import { CodeLibArticle } from '../../lib/CodeLib/types';
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
  codeLibArticles: Array<CodeLibArticle>;
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

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
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
    // 外枠は layoutSideSearchFrame で .cols と .nooverflow を定義
    // cols はできればここに書きたいが、flexなdivブロックがもう１重必要になる
    return (
      <>
        <div className="fixedFlex row">
          <div className="flex row">
            <TextInput
              placeholder="キーワード検索"
              value={this.props.searchBoxKeyword}
              onChange={this.handleChangeSearchBoxKeyword}
            />
          </div>
          <div className="fixedFlex row">
            <Select
              value={this.props.searchBoxLang}
              onChange={this.handleChangeSearchBoxLang}
              options={this.props.languageOptions}
            />
          </div>
        </div>
        <div className={'flex nooverflow ' + Style.scrollableY_forDesktop}>
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
