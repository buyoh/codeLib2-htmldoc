import React from 'react';
import Styles from './style.module.scss';

type Props = {
}

type State = {
}


class Header extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div className={Styles.header}>
        <h1>doc-codelib2</h1>
      </div>
    );
  }
}

export default Header;