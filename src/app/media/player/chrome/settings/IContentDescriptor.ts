import { Component } from "preact";
import { PopupType } from "./Popup";


export interface IContentDescriptor {
  name?: string;
}

export interface IInfoContentDescriptor extends IContentDescriptor {
  component: JSX.Element;
}

export interface IListContentDescriptor extends IContentDescriptor {
  items: IListItem[];
}
export interface IListItem {}
export interface IComponentListItem extends IListItem {
  discriminator: 'IComponentListItem';
  component: JSX.Element;
}
export interface ITextListItem extends IListItem {
  discriminator: 'ITextListItem';
  text: string;
  // Icon on left
  icon?: JSX.Element;
}
export function instanceofIComponentListItem(obj: any): obj is IComponentListItem {
  return obj.discriminator === 'IComponentListItem';
}
export function instanceofITextListItem(obj: any): obj is ITextListItem {
  return obj.discriminator === 'ITextListItem';
}

export interface IMenuContentDescriptor extends IContentDescriptor {
  items: IMenuItem[];
}
export interface IMenuItem {
  text: string;
  // Icon on left
  icon?: JSX.Element;
  // Submenu
  subMenu?: IContentDescriptor;
  subMenuType?: PopupType;
  onClick?: () => void;
}

export interface ISelectorContentDescriptor extends IContentDescriptor {
  name: string;
  mode: SelectorMode;
  items: ISelectorItem[];
  selected: string[]; // array for if in toggle mode
  onSelect: (item: ISelectorItem) => void;
}
export interface ISelectorItem extends ITextListItem {
  id: string;
}
export enum SelectorMode {
  Toggle="checkbox", Radio="radio"
}