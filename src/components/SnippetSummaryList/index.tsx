import React from 'react';

type Props = {
}

type State = {
}


class SnippetSummaryList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

export default SnippetSummaryList;