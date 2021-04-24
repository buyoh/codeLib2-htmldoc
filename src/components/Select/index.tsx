import React from 'react';
import Styles from './style.module.scss';

interface Option {
  key: string;
  label: string;
  value: string;
}

type Props = {
  value: string;
  options: Option[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
};

type State = {};

class Select extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <select
        className={[Styles.select, 'flex'].join(' ')}
        value={this.props.value}
        onChange={this.props.onChange}
      >
        {this.props.options.map((e) => (
          <option key={e.key} value={e.value}>
            {e.label}
          </option>
        ))}
      </select>
    );
  }
}

export default Select;
