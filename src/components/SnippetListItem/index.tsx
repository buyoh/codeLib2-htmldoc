import React from 'react';
import Styles from './style.module.scss';

type Props = {
  title: string,
  path: string,
  onSelect?: () => void,
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
        <div className={Styles.title}><a href='#' onClick={this.props.onSelect}>{this.props.title}</a></div>
        <div className={Styles.path}>{this.props.path}</div>
      </div>
    );
  }
}

export default SnippetListItem;