import React from 'react';

type Props = {
  children?: React.ReactNode;
};

type State = Record<string, never>;

class SnippetList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return <div style={{}}>{this.props.children}</div>;
  }
}

export default SnippetList;
