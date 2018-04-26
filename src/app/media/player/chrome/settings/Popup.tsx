import { h, Component } from "preact";
import { IPlayerApi, PlaybackState } from "../../IPlayerApi";
import { EventHandler } from "../../../../libs/events/EventHandler";
import { SettingsButton } from "../SettingsButton";
import { IContentDescriptor, IInfoContentDescriptor, IListContentDescriptor, IComponentListItem, instanceofIComponentListItem, instanceofITextListItem, IMenuContentDescriptor, ISelectorContentDescriptor } from "./IContentDescriptor";
import { isIPv6 } from "net";

export enum PopupType {
  Info, // Used to display information.
  List, // Shows a list of some type.
  Menu, // Shows a list of expandable options, each opening a popup.
  Selector, // Shows a list of options ot choose from. (e.g. a quality selector)
}

export interface IPopupProps {
  api: IPlayerApi;
  type: PopupType;
  parent?: Popup;
  topButton: SettingsButton;
  content: IContentDescriptor;
}

export class Popup extends Component<IPopupProps, {}> {
  private _handler = new EventHandler(this);
  
  private _type: PopupType;
  private _contentDescriptor: IContentDescriptor;
  private _parent?: Popup;
  private _topButton: SettingsButton;
  
  private _keepOpen: boolean = false;

  private _selectOptions: HTMLInputElement[] = [];

  private _onFocus() {

  }

  private _onBlur() {

  }

  componentDidMount() {
    this._handler
      .listen(this.base, 'focus', this._onFocus, { passive: true })
      .listen(this.base, 'blur', this._onBlur, { passive: true });
  }

  componentWillUnmount() {
    this._handler.removeAll();
  }

  private _processContent(): JSX.Element {
    let content = this._contentDescriptor;
    let type = this._type;

    if (type === PopupType.Info) {
      let infoContent = content as IInfoContentDescriptor;

      return infoContent.component;
    } else if (type === PopupType.List) {
      let listContent = content as IListContentDescriptor;
      let listContainer = (<div class="list-container"></div>);

      for (let item of listContent.items) {
        let listItem = (<div class="list-item"></div>);

        if (instanceofIComponentListItem(item)) {
          listItem.children.push(item.component!);
        } else if (instanceofITextListItem(item)) {
          listItem.children.push((<div class="item-icon">{item.icon}</div>));
          listItem.children.push((<div class="item-text">{item.text}</div>));
        }

        listContainer.children.push(listItem);
        listContainer.children.push((<div class="list-seperator"></div>));
      }

      listContainer.children.pop();

      return listContainer;
    } else if (type === PopupType.Menu) {
      let menuContent = content as IMenuContentDescriptor;
      let menuContainer = (<div class="menu-container"></div>);

      for (let item of menuContent.items) {
        let onClick = () => {};

        let showSub = item.subMenu && item.subMenuType && !item.onClick;

        if (showSub)
          onClick = () => {
            this._topButton.showPopup(item.subMenu!, item.subMenuType!, this);
          };
        else if (item.onClick) 
          onClick = () => {
            item.onClick!();
          };

        let menuItem = (
          <div class="menu-item" onClick={onClick} >
            <div class="item-icon">{item.icon}</div>
            <div class="item-text">{item.text}</div>
            {showSub ? (<div class="menu-arrow"></div>) : ""}
          </div>
        );

        menuContainer.children.push(menuItem);
        menuContainer.children.push((<div class="menu-seperator"></div>));
      }

      menuContainer.children.pop();

      return menuContainer;
    } else if (type === PopupType.Selector) {
      let selectContent = content as ISelectorContentDescriptor;
      let selectContainer = (<div class="select-container"></div>);

      for (let item of selectContent.items) {
        let inputRef = (element: HTMLInputElement) => {
          this._selectOptions.push(element);
        };

        let selectItem = (
          <label class="select-item" for={selectContent.name+"_"+item.id}>
            <input type={selectContent.mode} name={selectContent.name} value={item.id} id={selectContent.name+"_"+item.id} ref={inputRef}></input>
            <div class="select-item">
              <div class="item-icon">{item.icon}</div>
              <div class="item-text">{item.text}</div>
            </div>
          </label>
        );

        selectContainer.children.push(selectItem);
        selectContainer.children.push((<div class="select-seperator"></div>));
      }

      selectContainer.children.pop();

      return selectContainer;
    }

    return (<br></br>);
  }

  render(props: IPopupProps): JSX.Element {
    this._type = props.type;
    this._contentDescriptor = props.content;
    this._parent = props.parent;
    this._topButton = props.topButton;

    let content = this._processContent();

    return (
      <div class="popup">{content}</div>
    );
  }
}