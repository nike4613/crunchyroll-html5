import { h, Component, render } from "preact";
import { EventHandler } from "../../../libs/events/EventHandler";
import { PopupComponent, PopupType } from "../popup/PopupComponent";
import { IContentDescriptor } from "../popup/IContentDescriptor";
import { AssertionError } from "assert";
import "../../../libs/polyfill/Object";

export interface IPopupContainerState {
  popups: {[name: string]: JSX.Element};
}

export class PopupContainerComponent extends Component<{}, IPopupContainerState> {
  private _handler: EventHandler = new EventHandler(this);

  constructor() {
    super();

    this.state = {popups: {}};
  }

  showPopup(content: IContentDescriptor, type: PopupType, parent?: PopupComponent) {
    let popup = (<PopupComponent type={type} parent={parent} owner={this} content={content}></PopupComponent>);
    
    if (name in this.state.popups)
      throw new AssertionError({message: "A popup named " + name + "already exists"});

    let popups: {[name:string]:JSX.Element} = {};
    popups[content.name] = popup;
    this.setState({popups: popups});
  }

  destroyPopup(name: string) {
    if (!(name in this.state.popups))
      throw new AssertionError({message: "No such popup in popup list"});

    let popups = this.state.popups;
    delete popups[name];
    this.setState({popups:popups});
  }

  componentDidMount() {
    /*this._handler
      .listen(this.base, 'animationend', this._handleAnimationEnd, false)
      .listen(this.base, 'webkitAnimationEnd', this._handleAnimationEnd, false)
      .listen(this.base, 'MSAnimationEnd', this._handleAnimationEnd, false)
      .listen(this.base, 'oAnimationEnd', this._handleAnimationEnd, false);*/
  }

  componentWillUnmount() {
    this._handler.removeAll();
  }

  render(): JSX.Element {
    return (
      <div class="popup-container" style="display:inline;width:0px;height:0px;overflow:visible;">
        {Object.values(this.state.popups)}
      </div>
    );
  }
}