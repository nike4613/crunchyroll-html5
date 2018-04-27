import { h, Component } from "preact";
import { IPlayerApi, PlaybackState } from "../IPlayerApi";
import { EventHandler } from "../../../libs/events/EventHandler";
import { PopupContainerComponent } from "../chrome/PopupContainerComponent";
import { IContentDescriptor, IInfoContentDescriptor, IListContentDescriptor, IComponentListItem, instanceofIComponentListItem, instanceofITextListItem, IMenuContentDescriptor, ISelectorContentDescriptor } from "./IContentDescriptor";
import { isIPv6 } from "net";

export enum PopupType {
  Info, // Used to display information.
  List, // Shows a list of some type.
  Menu, // Shows a list of expandable options, each opening a popup.
  Selector, // Shows a list of options ot choose from. (e.g. a quality selector)
}

export interface IPopupProps {
  type: PopupType;
  parent?: PopupComponent;
  owner: PopupContainerComponent;
  content: IContentDescriptor;
  xpos?: number;
  ypos?: number;
}

export class PopupComponent extends Component<IPopupProps, {keepOpen:boolean}> {
  private _name: string;

  private _handler = new EventHandler(this);
  
  private _type: PopupType;
  private _contentDescriptor: IContentDescriptor;
  private _parent?: PopupComponent;
  private _owner: PopupContainerComponent;
  private _content: JSX.Element;

  private _selectOptions: HTMLInputElement[] = [];

  constructor(props: IPopupProps) {
    super(props);

    this._type = props.type;
    this._contentDescriptor = props.content;
    this._parent = props.parent;
    this._owner = props.owner;
    this._name = this._contentDescriptor.name;

    this._content = this._processContent();

    this.state = {keepOpen: false};
  }

  private _onFocus() {

  }

  private _onBlur() {
    if (!this.state.keepOpen) {
      if (this._parent){
        this._parent.setState({keepOpen:false});
        this._parent._onBlur(); // force call this on parent
      }

      this._owner.destroyPopup(this._name);
    }
  }

  shouldComponentUpdate(): boolean {
    return false; // never update
                  // no re-renders needed
  }

  componentDidMount() {
    this._handler
      .listen(this.base, 'focus', this._onFocus, { passive: true })
      .listen(this.base, 'blur', this._onBlur, { passive: true });
    this.base.style.top = this.props.ypos + "px";
    this.base.style.left = this.props.xpos + "px";
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
            this._owner.showPopup(item.subMenu!, item.subMenuType!, this);
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

  render(): JSX.Element {
    return (
      <div class="popup">{this._content}</div>
    );
  }
}