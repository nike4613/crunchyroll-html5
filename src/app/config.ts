import { IHttpClient } from "crunchyroll-lib/models/http/IHttpClient";
import { ContainerConstructor } from "crunchyroll-lib/utils/container";
import ccontainer from 'crunchyroll-lib/config';
import container from "../config/inversify.config";
import { IStorage, IStorageSymbol } from "./storage/IStorage";

// Set default HttpClient
let crossHttpClient = ccontainer.getConstructor<IHttpClient>("IHttpClient");

export function setCrossHttpClient(httpClient: ContainerConstructor<IHttpClient>): void {
  crossHttpClient = httpClient;
}

export function bindCrossHttpClientAsDefault(): void {
  ccontainer.bind("IHttpClient", crossHttpClient);
}

export interface IGlobalSettings {
  // sync: boolean; // in WebExtenstionMechanism.sync
  syncResolution: boolean;

  load(): Promise<void>;
  save(): Promise<void>;
}

interface ISerializedSettings { 
  sync_res: boolean;
}

class GlobalSettingsImpl implements IGlobalSettings {
  private _syncRes: boolean = false;

  get syncResolution(): boolean {
    return SyncConfig.sync && this._syncRes;
  }

  set syncResolution(val: boolean) {
    this._syncRes = val;
  }

  async load(): Promise<void> {
    const storage = container.get<IStorage>(IStorageSymbol);

    let settings = await storage.get<ISerializedSettings>("settings");
    if (!settings) 
      settings = {
        sync_res:true // default to true when loading
      }; 
    
    this.syncResolution = settings!.sync_res;

    await this.save(); // ensure if we loaded defaults they get saved; also updates syncResolution based on 
                       // sync option
  }
  async save(): Promise<void> {
    const storage = container.get<IStorage>(IStorageSymbol);

    let settings = {
      sync_res: this.syncResolution
    } as ISerializedSettings;

    await storage.set<ISerializedSettings>("settings", settings);
  }
}

let global = new GlobalSettingsImpl() as IGlobalSettings;
export default global;

export class SyncConfig {
  private static _sync: boolean = false;
  private static _untempsync: boolean = false;
  private static _isActive: boolean = false;
  private static _canModifyActive: boolean = true;

  static set isExtension(val: boolean) {
    if (!this._canModifyActive)
      throw "Trying to modify SyncConfig isExtension after it has been disabled!";
    this._isActive = val;
  }

  static disableIsExtensionWrite(): void {
    this._canModifyActive = false;
  }

  static get isExtension(): boolean {
    return this._isActive;
  }

  static get sync(): boolean {
    return this.isExtension && this._sync;
  }

  static set sync(val: boolean) {
    this._sync = val;
    if (browser) // only set if we can (and if is extension)
      browser.storage.sync.set({"sync": val}); // no need to wait for it
  }

  static tempSync(val: boolean|null = null) {
    if (val === null) { // reset
      this._sync = this._untempsync;
    } else {
      this._untempsync = this._sync;
      this._sync = val!;
    }
  }
}