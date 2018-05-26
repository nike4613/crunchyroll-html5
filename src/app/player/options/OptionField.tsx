import { h, Component, ComponentProps } from 'preact';
import { POINT_CONVERSION_UNCOMPRESSED } from 'constants';

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

  abstract getInput(props: PropType&ComponentProps<this>, disabled?: boolean): JSX.Element | null;

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

    const input = this.getInput(props, disabled)!;
    if (!input.attributes) input.attributes = {}; // ensure that this exists
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

export interface IInputFieldProps extends IOptionFieldProps {
  onChange?: (evt: Event) => void;
}

export interface ICheckboxFieldProps extends IInputFieldProps {
  checked?: boolean;
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

export interface IChildFieldProps extends IOptionFieldProps {

}

export interface IChildFieldState extends IOptionFieldState {

}

export class ChildField extends OptionField<IChildFieldProps, IChildFieldState> {
  getInput(props: IChildFieldProps&ComponentProps<this>, disabled?: boolean | undefined): JSX.Element | null {
    return props.children![0];
  }
}