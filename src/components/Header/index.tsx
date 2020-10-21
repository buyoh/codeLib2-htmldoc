import React from 'react';
import Styles from './style.module.scss';

type Props = {};

type State = {};

class Header extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div className={Styles.header}>
        <div className={Styles.title}>doc-codelib2</div>
      </div>
    );
  }
}

export default Header;
