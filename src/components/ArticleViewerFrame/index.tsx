import React from 'react';
import Styles from './style.module.scss';

type Props = {
  children?: React.ReactNode;
};

type State = Record<string, never>;

class ArticleViewFrame extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div>
        <article className={Styles.article}>{this.props.children}</article>
      </div>
    );
  }
}

export default ArticleViewFrame;
