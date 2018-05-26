import { h, Component } from 'preact';
import { IStorageSymbol, IStorage } from '../../storage/IStorage';
import Portal from '../../libs/Portal';
import { WebExtensionMechanism } from '../../storage/mechanism/WebExtensionMechanism';
import { saveSelectedQuality } from '../StandardPlayer';
import GlobalConfig from "../../config";
import { CheckboxField, ChildField } from './OptionField';

export interface IOptionsPopupProps {
  //isWebextension: boolean;
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

  render(props: IOptionsPopupProps) {
    const open = () => this.setState({visible: true});
    const close = () => this.setState({visible: false});

    const webext = WebExtensionMechanism.active;
    
    let syncing = false;
    if (webext) {
      syncing = WebExtensionMechanism.sync;
    }

    const synccheck = (cb: CheckboxField) => this._syncCheckbox = cb;
    const ressynccheck = (cb: CheckboxField) => this._resolutionSyncCheckbox = cb;

    const updateSyncOpts = () => {
      this._resolutionSyncCheckbox.disabled = !this._syncCheckbox.checked;
    };

    const save = () => {
      GlobalConfig.syncResolution = this._resolutionSyncCheckbox.checked; // update global

      if (webext) {
        WebExtensionMechanism.sync = this._syncCheckbox.checked;
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
}