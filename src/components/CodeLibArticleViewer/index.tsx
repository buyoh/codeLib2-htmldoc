import React from 'react';
import { CodeLibArticle } from '../../lib/CodeLib/types';
import ArticleViewFrame from '../ArticleViewerFrame';
import Badge from '../Badge';
import * as Impl from './impl';
import { prependUrlComment } from '../../lib/CodeLib/code';
import { articleAbsoluteUrl } from '../../lib/CodeLib/url';

type Props = {
  article: CodeLibArticle;
  // 記事の絶対 URL を組み立てるための origin (例: https://hostname)
  origin: string;
};

type State = Record<string, never>;

class CodeLibArticleViewer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <ArticleViewFrame>
        <h1>{this.props.article.title}</h1>
        <div>
          <Badge text={this.props.article.lang} variant="primary"></Badge>
        </div>
        <div>keyword:{this.props.article.words?.join(' ')}</div>
        <hr />

        <div>
          <h2>overview</h2>
          <p className="text">{this.props.article.overview}</p>
        </div>

        {this.props.article.verified ? (
          <div>
            <h2>verified</h2>
            <div>
              {Impl.convertToReferenceList(this.props.article.verified)}
            </div>
          </div>
        ) : null}

        {this.props.article.references ? (
          <div>
            <h2>references</h2>
            <div>
              {Impl.convertToReferenceList(this.props.article.references)}
            </div>
          </div>
        ) : null}

        {this.props.article.require ? (
          <div>
            <h2>require</h2>
            <pre>{Impl.convertToRequireList(this.props.article.require)}</pre>
          </div>
        ) : null}

        <div>
          <h2>code</h2>
          <textarea
            className="display"
            rows={30}
            readOnly={true}
            value={prependUrlComment(
              this.props.article.code,
              this.props.article.lang,
              articleAbsoluteUrl(this.props.origin, this.props.article.path)
            )}
          />
        </div>

        <div>
          <h2>commits</h2>
          {this.props.article.commits.map((com) => (
            <div style={{ fontFamily: 'monospace' }} key={com.sha}>
              {com.sha.slice(0, 8)}({com.date}): {com.message}
            </div>
          ))}
        </div>
      </ArticleViewFrame>
    );
  }
}

export default CodeLibArticleViewer;
