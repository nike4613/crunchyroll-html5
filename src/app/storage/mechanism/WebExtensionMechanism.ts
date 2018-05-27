import { StorageError } from "../StorageError";
import { IMechanism } from "./IMechanism";
import * as browser from 'webextension-polyfill';
import { injectable } from "inversify";
import { SyncConfig } from "../../config";

@injectable()
export class WebExtensionMechanism implements IMechanism {
  /**
   * BEGIN code to allow optional sync
   */
  static get storage(): browser.storage.StorageArea {
    return SyncConfig.sync ? browser.storage.sync : browser.storage.local;
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