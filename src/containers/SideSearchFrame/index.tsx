import React, { ChangeEvent } from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import '../../style/style-screen.scss';
import { RootState } from '../../stores';
import { CodeLibArticle } from '../../lib/CodeLib/types';
import * as CodeLibActions from '../../stores/codelib/actions';
import * as SearchBoxActions from '../../stores/searchbox/actions';
import * as Impl from './impl';
import CodeLib from '../../lib/CodeLib';
import SnippetListItem from '../../components/SnippetListItem';
import SnippetList from '../../components/SnippetList';
import TextInput from '../../components/TextInput';

//

type Props = {
  onSelectArticle: (path: string) => void
}

type State = {
}

//

type StateProps = {
  codeLibArticles: Array<CodeLibArticle>
  searchBoxKeyword: string
}

type DispatchProps = {
  onFetchCodeLibData: (items: Array<CodeLibArticle>) => void
  onChangeSearchBoxKeyword: (keyword: string) => void
}

type CombinedProps = Props & StateProps & DispatchProps;

//

function mapStateToProps(state: RootState): StateProps {
  return {
    codeLibArticles:
      Impl.filterCodeLibArticles(state.codeLib.items, state.searchBox.keyword)
        .sort((l, r) => l.path.localeCompare(r.path)),
    searchBoxKeyword:
      state.searchBox.keyword
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    onFetchCodeLibData:
      (items: Array<CodeLibArticle>) => dispatch(CodeLibActions.setItems(items)),
    onChangeSearchBoxKeyword:
      (keyword: string) => dispatch(SearchBoxActions.updateKeyword(keyword)),
  };
}

//

class SideSearchFrame extends React.Component<CombinedProps, State> {
  constructor(props: CombinedProps) {
    super(props);
    this.state = {};

    this.handleChangeSearchBoxKeyword = this.handleChangeSearchBoxKeyword.bind(this);
  }

  componentDidMount(): void {
    (async () => {
      const items = await CodeLib.fetchAll();
      this.props.onFetchCodeLibData(items);
    })();
  }

  // componentWillUnmount(): void  // for unscribe

  handleChangeSearchBoxKeyword(e: ChangeEvent<HTMLInputElement>) {
    this.props.onChangeSearchBoxKeyword(e.target.value);
  }

  render(): JSX.Element {
    return (
      <div className='fixedFlex cols nooverflow'>
        <div className='fixedFlex'>
          <TextInput placeholder='キーワード検索'
            value={this.props.searchBoxKeyword} onChange={this.handleChangeSearchBoxKeyword} />
        </div>
        <div className='flex nooverflow scrollableY' >
          <SnippetList>
            {this.props.codeLibArticles ? this.props.codeLibArticles.map(item => (
              <SnippetListItem
                title={item.title} path={item.path} key={item.path}
                onSelect={() => this.props.onSelectArticle(item.path)}
              />
            )) : null}
          </SnippetList>
        </div>

      </div >
    );
  }
}

export default connect<StateProps, DispatchProps, Props, RootState>(mapStateToProps, mapDispatchToProps)(SideSearchFrame);
