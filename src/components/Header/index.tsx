import React from 'react';
import { Link } from 'react-router-dom';
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
        <div className={Styles.title}>
          <Link to="/">doc-codelib2</Link>
        </div>
      </div>
    );
  }
}

export default Header;
