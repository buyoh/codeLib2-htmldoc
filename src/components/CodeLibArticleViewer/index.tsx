import React from 'react';
import { CodeLibArticle } from '../../lib/CodeLib/types';
// import Styles from './style.module.scss';

type Props = {
  article: CodeLibArticle
}

type State = {
}


class CodeLibArticleViewer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div>
        <article style={{
          maxWidth: '800px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <h1>{this.props.article.title}</h1>
          <div>keyword:{this.props.article.words?.join(' ')}</div>
          <hr />

          <h2>overview</h2>
          <p className="text">{this.props.article.overview}</p>

          <h2>usage</h2>
          <pre>usage</pre>

          <h2>verified</h2>
          <pre>{this.props.article.verified}</pre>

          <h2>references</h2>
          <pre>{this.props.article.references?.join('\n')}</pre>

          {/* <h2>require</h2>
<pre><%= @doc[:require] %></pre>
<ul>
<% @doc[:require].split.map{|str| str=~/src\/([0-9a-zA-Z\/._-]+)/; $1}.compact.each do |req| %>
  <% if !req.empty? %>
    <li><a href="/search?word=<%= CGI.escape(req) %>"><%= req %></a></li>
  <% end %>
<% end %>
</ul> */}

          <h2>code</h2>
          <textarea className="display" rows={30} readOnly={true} value={this.props.article.code} />

          {/* <h2>last commit</h2>
<div>[<%= @commit[:sha][0..7] %>](<%= @commit[:date].strftime("%Y-%m-%d %H:%M") %>) <%= @commit[:message] %></div> */}
        </article>
      </div>
    );
  }
}

export default CodeLibArticleViewer;