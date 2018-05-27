import { h, Component } from 'preact';
import { IStorageSymbol, IStorage } from '../../storage/IStorage';
import Portal from '../../libs/Portal';
import { saveSelectedQuality } from '../StandardPlayer';
import GlobalConfig, { SyncConfig } from "../../config";
import { CheckboxField, ChildField } from './OptionField';

export interface IOptionsPopupProps {
  //isWebextension: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export interface IOptionsPopupState {
  visible: boolean;
}

export class OptionsPopup extends Component<IOptionsPopupProps, IOptionsPopupState> {

  private _syncCheckbox: CheckboxField;
  private _resolutionSyncCheckbox: CheckboxField;

  open() {
    this.setState({visible: true});
  }

  close() {
    this.setState({visible: false});
  }

  componentDidUpdate(oldProps: IOptionsPopupProps, oldState: IOptionsPopupState) {
    if (!this.state.visible && oldState.visible) // was open, now isn't
      if (this.props.onClose)
        this.props.onClose();
    if (this.state.visible && !oldState.visible) // wasn't open, now is
      if (this.props.onOpen)
        this.props.onOpen();
  }

  render(props: IOptionsPopupProps) {
    const close = this.close.bind(this);

    const webext = SyncConfig.isExtension;
    
    let syncing = false;
    if (webext) {
      syncing = SyncConfig.sync;
    }

    const synccheck = (cb: CheckboxField) => this._syncCheckbox = cb;
    const ressynccheck = (cb: CheckboxField) => this._resolutionSyncCheckbox = cb;

    const updateSyncOpts = () => {
      this._resolutionSyncCheckbox.disabled = !this._syncCheckbox.checked;
    };

    const save = () => {
      GlobalConfig.syncResolution = this._resolutionSyncCheckbox.checked; // update global

      if (webext) {
        SyncConfig.sync = this._syncCheckbox.checked;
        saveSelectedQuality(); // this saves quality to storage; that's whats important
      }

      GlobalConfig.save(); // save global config
    };

    // Portal injects the children into the specified element
    return (
      this.state.visible ? (
        <Portal into="body">
          <div class="popup-container">
            <div class="options popup">
              <span class="close-button" onClick={close}></span>

              { webext ? (
                [
                  <CheckboxField checked={syncing} ref={synccheck} onChange={updateSyncOpts}>
                    Use <code>browser.storage.sync</code>
                  </CheckboxField>,
                  <CheckboxField checked={GlobalConfig.syncResolution} disableable disabled={!syncing} ref={ressynccheck}>
                    Sync resolution prefrences across devices
                  </CheckboxField>]
              ): <div class="no-options-avaliable"></div> }

              <div><button onClick={save}>Save</button><span class="spacer"></span><button onClick={close}>Cancel</button></div>
            </div>
          </div>
        </Portal>
      ) : null
    );
  }

  get visible(): boolean {
    return this.state.visible;
  }
}