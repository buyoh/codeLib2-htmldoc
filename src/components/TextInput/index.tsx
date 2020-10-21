import React from 'react';
import Styles from './style.module.scss';

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

type State = {};

class TextInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    return (
      <div className="flex row">
        <input
          type="text"
          className={[Styles.textInput, 'flex'].join(' ')}
          placeholder={this.props.placeholder}
          value={this.props.value}
          onChange={this.props.onChange}
        />
      </div>
    );
  }
}

export default TextInput;
