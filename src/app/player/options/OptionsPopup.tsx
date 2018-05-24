import { h, Component } from 'preact';
import { IStorageSymbol, IStorage } from '../../storage/IStorage';
import Portal from '../../libs/Portal';
import { WebExtensionMechanism } from '../../storage/mechanism/WebExtensionMechanism';
import { saveSelectedQuality } from '../StandardPlayer';
import GlobalConfig from "../../config";

export interface IOptionsPopupProps {
  //isWebextension: boolean;
}

export interface IOptionsPopupState {
  visible: boolean;
}

export class OptionsPopup extends Component<IOptionsPopupProps, IOptionsPopupState> {

  private _syncCheckbox: HTMLInputElement;
  private _resolutionSyncCheckbox: HTMLInputElement;
  private _resolutionSyncLabel: HTMLSpanElement;

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

    const synccheck = (cb: HTMLInputElement) => this._syncCheckbox = cb;
    const ressynccheck = (cb: HTMLInputElement) => this._resolutionSyncCheckbox = cb;
    const ressynclabel = (lbl: HTMLSpanElement) => this._resolutionSyncLabel = lbl;

    const updateSyncOpts = () => {
      this._resolutionSyncCheckbox.disabled = !this._syncCheckbox.checked;
      this._resolutionSyncLabel.classList.toggle("disabled");
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
              <span className="close-button" onClick={close}></span>

              { webext ? (
                [<span>Use <code>browser.storage.sync</code></span>, <input type="checkbox" checked={syncing} ref={synccheck} onChange={updateSyncOpts}></input>,
                 <span className={"disableable" + (syncing ? "" : " disabled")} ref={ressynclabel}>Sync resolution prefrences across devices</span>, <input type="checkbox" checked={GlobalConfig.syncResolution} ref={ressynccheck}></input>]
              ): <div className="no-options-avaliable"></div> }

              <div><button onClick={save}>Save</button><span className="spacer"></span><button onClick={close}>Cancel</button></div>
            </div>
          </div>
        </Portal>
      ) : null
    );
  }
}