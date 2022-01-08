import React from 'react';
import ArticleViewFrame from '../../components/ArticleViewerFrame';
import ExternalLink from '../../components/ExternalLink';

// note:
// containers を子に持つ components …になる予定

type Props = {};

type State = {};

class TopContentFrame extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <ArticleViewFrame>
        <h1>doc-codeLib2</h1>
        <div>
          author[
          <ExternalLink to="https://github.com/buyoh/codeLib2">
            buyoh
          </ExternalLink>
          ]
        </div>
        <hr />
        <h2>ようこそ</h2>
        <p>
          本ページは、
          <ExternalLink to="https://github.com/buyoh/codeLib2">
            codeLib2
          </ExternalLink>
          をドキュメント化したものです。
        </p>
        <p>気になった点を報告したい方は上記repositoryのissueよりお願いします</p>
        {/* <h2>coverage</h2> */}
      </ArticleViewFrame>
    );
  }
}

export default TopContentFrame;
