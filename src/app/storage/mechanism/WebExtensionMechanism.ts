import { StorageError } from "../StorageError";
import { IMechanism } from "./IMechanism";
import * as browser from 'webextension-polyfill';
import { injectable } from "inversify";

@injectable()
export class WebExtensionMechanism implements IMechanism {
  /**
   * BEGIN code to allow optional sync
   */
  private static _sync: boolean = false;

  static get sync(): boolean {
    return this._sync;
  }

  static set sync(val: boolean) {
    this._sync = val;
    browser.storage.sync.set({"sync": val}); // no need to wait for it
  }

  static get storage(): browser.storage.StorageArea {
    return this.sync ? browser.storage.sync : browser.storage.local;
  }
  /**
   * END code to allow optional sync
   */

  async set(key: string, value: string): Promise<void> {
    const obj = {} as any;
    obj[key] = value;
    await WebExtensionMechanism.storage.set(obj);
  }

  async get(key: string): Promise<string> {
    const values = await WebExtensionMechanism.storage.get(key);
    const value = values[key];
    if (typeof value !== "string" && value !== null) {
      throw StorageError.InvalidValue;
    }
    return value;
  }

  async remove(key: string): Promise<void> {
    await WebExtensionMechanism.storage.remove(key);
  }
}