import { h, Component, ComponentProps } from 'preact';

export interface IOptionFieldProps {
  label?: string; // if null, uses children
  disableable?: boolean;
  disabled?: boolean;
}

export interface IOptionFieldState {
  disabled: boolean;
  override: boolean;
}

export abstract class OptionField<PropType extends IOptionFieldProps, StateType extends IOptionFieldState> extends Component<PropType, StateType> {

  private _label: HTMLSpanElement;

  abstract getInput(props: PropType, disabled?: boolean): JSX.Element;

  constructor() {
    super();

    this.state = {
      disabled: false,
      override: false,
    } as StateType;
  }

  shouldComponentUpdate(nextProps: IOptionFieldProps, nextState: StateType, oldProps: IOptionFieldProps) {
    return nextState.override || nextProps != oldProps;
  }

  render(props: PropType&ComponentProps<this>): JSX.Element {

    let disabled = props.disableable !== undefined && props.disableable 
                     && props.disabled !== undefined && props.disabled!;
    disabled = this.state.override ? this.state.disabled : disabled;

    let subInputRef = (node: Node) => {};
    const refLabel = (label: HTMLSpanElement) => {
      this._label = label;
    };
    const refInput = (node: Node) => {
      subInputRef(node);
    };

    const label = props.label || props.children;
    const labelClass = props.disableable ? "disableable" + (disabled ? " disabled" : "") : ""; 

    const input = this.getInput(props, disabled);
    subInputRef = input.attributes['ref'] || subInputRef;
    input.attributes['ref'] = refInput;

    return (
      <div class="subgrid">
        <span class={labelClass} ref={refLabel}>{label}</span>
        {input}
      </div>
    );
  }

  get disabled(): boolean {
    return this.state.disabled;
  }
  set disabled(val: boolean) {
    this.setState({
      disabled: val,
      override: true,
    })
  }

}

export interface ICheckboxFieldProps extends IOptionFieldProps {
  checked?: boolean;
  onChange?: (evt: Event) => void;
}

export interface ICheckboxFieldState extends IOptionFieldState {
  checked?: boolean;
}

export class CheckboxField extends OptionField<ICheckboxFieldProps, ICheckboxFieldState> {

  private _checkbox: HTMLInputElement;

  constructor() {
    super();

    this.state.checked = undefined;
  }

  componentWillRecieveProps(newProps: ICheckboxFieldProps) {
    this.setState({
      checked: newProps.checked!, 
      override: true,
    });
  }

  getInput(props: ICheckboxFieldProps, disabled: boolean): JSX.Element {
    const refCheckbox = (cb: HTMLInputElement) => this._checkbox = cb;

    const checked = this.state.checked !== undefined ? this.state.checked! : props.checked!;

    return (
      <input type="checkbox" checked={checked} onChange={props.onChange} disabled={disabled} ref={refCheckbox}></input>
    );
  }

  get checked(): boolean {
    return this._checkbox.checked;
  }
  set checked(val: boolean) {
    this.setState({
      checked: val,
      override: true,
    });
  }

}