import { StorageError } from "../StorageError";
import { IMechanism } from "./IMechanism";
import * as browser from 'webextension-polyfill';
import { injectable } from "inversify";

@injectable()
export class WebExtensionMechanism implements IMechanism {
  /**
   * BEGIN code to allow optional sync
   */
  private _sync: boolean = false;

  get sync(): boolean {
    return this._sync;
  }

  set sync(val: boolean) {
    this._sync = val;
    browser.storage.sync.set({"sync": val}); // no need to wait for it
  }

  get storage(): browser.storage.StorageArea {
    return this.sync ? browser.storage.sync : browser.storage.local;
  }
  /**
   * END code to allow optional sync
   */

  async set(key: string, value: string): Promise<void> {
    const obj = {} as any;
    obj[key] = value;
    await this.storage.set(obj);
  }

  async get(key: string): Promise<string> {
    const values = await this.storage.get(key);
    const value = values[key];
    if (typeof value !== "string" && value !== null) {
      throw StorageError.InvalidValue;
    }
    return value;
  }

  async remove(key: string): Promise<void> {
    await this.storage.remove(key);
  }
}