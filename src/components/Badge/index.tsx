import React from 'react';
import Styles from './style.module.scss';

type Props = {
  text: string;
  alt?: string;
  style?: number;
};

type State = {};

function badgeStyle(style?: number): string {
  return style == 1 ? Styles.badge1 : '';
}

class Badge extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <span title={this.props.alt} className={badgeStyle(this.props.style)}>
        {this.props.text}
      </span>
    );
  }
}

export default Badge;
