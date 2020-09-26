import React from 'react';

type Props = {
  to: string
}

type State = {
}


class ExternalLink extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <a href={this.props.to} target="_blank" rel="noreferrer noopener">
        {this.props.children}
      </a>
    );
  }
}

export default ExternalLink;