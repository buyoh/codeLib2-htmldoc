import React from 'react';

type Props = {
  text: string;
  alt: string;
  // type: number,  // TODO: 背景とか角丸とか
};

type State = {};

class Badge extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return <span title={this.props.alt}>{this.props.text}</span>;
  }
}

export default Badge;
