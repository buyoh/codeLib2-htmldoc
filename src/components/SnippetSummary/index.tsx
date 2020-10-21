import React from 'react';
import Styles from './style.module.scss';

type Props = {
  title: string;
  path: string;
  keywords: Array<string>;
  date: string;
};

type State = {};

class SnippetSummary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div className={Styles.item}>
        <div className={Styles.title}>
          <a href="#">{this.props.title}</a>
        </div>
        <div className={'left'}>
          <div className={Styles.path}>{this.props.path}</div>
          <div className={Styles.keyword}>
            keyword: {this.props.keywords.join(',')}
          </div>
        </div>
        <div className={'right'}>
          <div className={Styles.datetime}>{this.props.date}</div>
        </div>
        <div className={'clear'}></div>
        {/* TODO: bad workround */}
      </div>
    );
  }
}

export default SnippetSummary;
