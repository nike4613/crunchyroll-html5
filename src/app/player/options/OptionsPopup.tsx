import { h, Component } from 'preact';
import { IStorageSymbol, IStorage } from '../../storage/IStorage';
import Portal from '../../libs/Portal';
import { WebExtensionMechanism } from '../../storage/mechanism/WebExtensionMechanism';

export interface IOptionsPopupProps {
  isWebextension: boolean;
}

export interface IOptionsPopupState {
  visible: boolean;
}

export class OptionsPopup extends Component<IOptionsPopupProps, IOptionsPopupState> {

  open() {
    this.setState({visible: true});
  }

  render(props: IOptionsPopupProps) {
    const open = () => this.setState({visible: true});
    const close = () => this.setState({visible: false});

    let inBrowser = props.isWebextension;
    
    let syncing = false;
    if (inBrowser) {
      syncing = WebExtensionMechanism.sync;
    }

    // Portal injects the children into the specified element
    return (
      this.state.visible ? (
        <Portal into="div#showmedia_video">
          <div class="options popup" onClick={close}>
            { inBrowser ? (
              [<span className="opt-name">Use browser.storage.sync</span>,  <input type="checkbox" checked={syncing}></input>]
            ): null }
            <span className="opt-name">NONOPT</span>  <input type="checkbox" checked={false}></input>
            <button>BUTN</button>
          </div>
        </Portal>
      ) : null
    );
  }
}