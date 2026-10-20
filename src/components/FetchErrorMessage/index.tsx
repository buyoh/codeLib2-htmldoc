import React from 'react';
import Styles from './style.module.scss';

type Props = {
  error: string;
};

type State = Record<string, never>;

class FetchErrorMessage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div className={Styles.fetchError} role="alert">
        記事データの読み込みに失敗しました。時間をおいて再読み込みしてください。
        <div className={Styles.detail}>{this.props.error}</div>
      </div>
    );
  }
}

export default FetchErrorMessage;
