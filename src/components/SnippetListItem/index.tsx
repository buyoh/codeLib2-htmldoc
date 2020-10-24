import React from 'react';
import Styles from './style.module.scss';
import { Link } from 'react-router-dom';
import { CodeLibArticle } from '../../lib/CodeLib/types';
import Badge from '../Badge';

type Props = {
  article: CodeLibArticle;
  linkto: string;
};

type State = {};

class SnippetListItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const article = this.props.article;
    return (
      <div className={Styles.item}>
        <div className={Styles.title}>
          <Link to={this.props.linkto}>{article.title}</Link>
          {article.tested_by.length > 0 ? <Badge text="✅" alt="tested" /> : ''}
        </div>
        <div className={Styles.path}>{article.path}</div>
      </div>
    );
  }
}

export default SnippetListItem;
