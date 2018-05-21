import { h, Component } from 'preact';
import container from "../../../config/inversify.config";
import { IStorageSymbol, IStorage } from '../../storage/IStorage';
import Portal from '../../libs/Portal';

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

    // Portal injects the children into the specified element
    return (
      this.state.visible ? (
        <Portal into={document.querySelector("div#showmedia_video") as Element}>
          <div class="options popup" onClick={close}>
            HALLO
          </div>
        </Portal>
      ) : null
    );
  }
}