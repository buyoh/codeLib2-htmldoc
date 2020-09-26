import React from 'react';
import Styles from './style.module.scss';
import { Link } from 'react-router-dom';

type Props = {
  title: string,
  path: string
}

type State = {
}


class SnippetListItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div className={Styles.item}>
        <div className={Styles.title}><Link to={`${this.props.path}.html`}>{this.props.title}</Link></div>
        <div className={Styles.path}>{this.props.path}</div>
      </div>
    );
  }
}

export default SnippetListItem;