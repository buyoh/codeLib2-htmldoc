import React from 'react';
import Styles from './style.module.scss';

type Props = {
  text: string;
  alt?: string;
  variant?: 'primary';
};

type State = Record<string, never>;

function badgeStyle(variant?: Props['variant']): string {
  return variant === 'primary' ? Styles.badge1 : '';
}

class Badge extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <span title={this.props.alt} className={badgeStyle(this.props.variant)}>
        {this.props.text}
      </span>
    );
  }
}

export default Badge;
