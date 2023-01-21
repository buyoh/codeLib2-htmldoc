import React, { ChangeEvent } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import '../../style/page.scss';
import { RootState } from '../../stores';
import { CodeLibArticle } from '../../lib/CodeLib/types';
import * as SearchBoxActions from '../../stores/searchbox/actions';
import * as Impl from './impl';
import SnippetListItem from '../../components/SnippetListItem';
import SnippetList from '../../components/SnippetList';
import TextInput from '../../components/TextInput';
import Select from '../../components/Select';

//

type Props = {};

type State = {};

//

type StateProps = {
  codeLibArticles: Array<CodeLibArticle>;
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
    codeLibArticles: Impl.filterCodeLibArticles(
      state.codeLib.items,
      state.searchBox.keyword,
      state.searchBox.lang
    ).sort((l, r) => l.path.localeCompare(r.path)),
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

function getLanguageList() {
  // todo: jsonから読み込むようにする
  return [
    {
      value: '',
      label: 'all',
    },
    {
      value: 'cpp',
      label: 'C++',
    },
    {
      value: 'javascript',
      label: 'JS',
    },
    {
      value: 'ruby',
      label: 'Ruby',
    },
    {
      value: 'rust',
      label: 'Rust',
    },
  ];
}

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
    return (
      <div className={'cols'}>
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
              options={getLanguageList().map((e) => ({ ...e, key: e.value }))}
            />
          </div>
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
