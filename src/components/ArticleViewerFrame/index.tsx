import React from 'react';

type Props = {};

type State = {};

class ArticleViewFrame extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div>
        <article
          style={{
            maxWidth: '800px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {this.props.children}
        </article>
      </div>
    );
  }
}

export default ArticleViewFrame;
