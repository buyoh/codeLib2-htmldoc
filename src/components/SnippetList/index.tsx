import React from 'react';

type Props = {
}

type State = {
}


class SnippetList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div style={{}}>
        {this.props.children}
      </div>
    );
  }
}

export default SnippetList;