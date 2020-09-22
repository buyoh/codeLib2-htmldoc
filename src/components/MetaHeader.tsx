import React from 'react';
import Helmet from 'react-helmet';

export default function MetaHeader(): JSX.Element {
  return (
    <Helmet>
      <title>codeLib2</title>
    </Helmet>
  );
}
MetaHeader.displayName = 'Meta';
