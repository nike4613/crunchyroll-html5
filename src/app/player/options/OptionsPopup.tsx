import { h, Component } from 'preact';
import { IStorageSymbol, IStorage } from '../../storage/IStorage';
import Portal from '../../libs/Portal';
import { WebExtensionMechanism } from '../../storage/mechanism/WebExtensionMechanism';
import { updateQualitySettings } from '../StandardPlayer';

export interface IOptionsPopupProps {
  isWebextension: boolean;
}

export interface IOptionsPopupState {
  visible: boolean;
}

export class OptionsPopup extends Component<IOptionsPopupProps, IOptionsPopupState> {

  private _syncCheckbox: HTMLInputElement;

  open() {
    this.setState({visible: true});
  }

  render(props: IOptionsPopupProps) {
    const open = () => this.setState({visible: true});
    const close = () => this.setState({visible: false});

    let webext = props.isWebextension;
    
    let syncing = false;
    if (webext) {
      syncing = WebExtensionMechanism.sync;
    }

    const synccheck = (cb: HTMLInputElement) => this._syncCheckbox = cb;

    const save = () => {
      if (webext) {
        WebExtensionMechanism.sync = this._syncCheckbox.checked;
        updateQualitySettings(); // this saves quality to storage; that's whats important
      }
    };

    // Portal injects the children into the specified element
    return (
      this.state.visible ? (
        <Portal into="body">
          <div class="popup-container">
            <div class="options popup">
              <span className="close-button" onClick={close}></span>

              { webext ? (
                [<span className="opt-name">Use <code>browser.storage.sync</code></span>,  <input type="checkbox" checked={syncing} ref={synccheck}></input>]
              ): null }
              <div><button onClick={save}>Save</button><span className="spacer"></span><button onClick={close}>Cancel</button></div>
            </div>
          </div>
        </Portal>
      ) : null
    );
  }
}