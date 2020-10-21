import React from 'react';
import { CodeLibArticle } from '../../lib/CodeLib/types';
import * as Impl from './impl';
// import Styles from './style.module.scss';

type Props = {
  article: CodeLibArticle;
};

type State = {};

class CodeLibArticleViewer extends React.Component<Props, State> {
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
          <h1>{this.props.article.title}</h1>
          <div>keyword:{this.props.article.words?.join(' ')}</div>
          <hr />

          <div>
            <h2>overview</h2>
            <p className="text">{this.props.article.overview}</p>
          </div>

          {/* <h2>usage</h2>
          <pre>usage</pre> */}

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
              value={this.props.article.code}
            />
          </div>

          <div>
            <h2>commits</h2>
            {this.props.article.commits.map((com) => (
              <div style={{ fontFamily: 'monospace' }}>
                {com.sha.substr(0, 8)}({com.date}): {com.message}
              </div>
            ))}
          </div>

          {/* <h2>last commit</h2>
<div>[<%= @commit[:sha][0..7] %>](<%= @commit[:date].strftime("%Y-%m-%d %H:%M") %>) <%= @commit[:message] %></div> */}
        </article>
      </div>
    );
  }
}

export default CodeLibArticleViewer;
