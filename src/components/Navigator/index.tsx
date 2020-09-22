import React from 'react';
import Styles from './style.module.scss';

type Props = {
}

type State = {
}


class Navigator extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div className={Styles.navigator} role="navigation">
      </div>
    );
  }
}

export default Navigator;