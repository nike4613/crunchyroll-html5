import { IHttpClient } from "crunchyroll-lib/models/http/IHttpClient";
import { ContainerConstructor } from "crunchyroll-lib/utils/container";
import ccontainer from 'crunchyroll-lib/config';
import { WebExtensionMechanism } from "./storage/mechanism/WebExtensionMechanism";
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
    return WebExtensionMechanism.sync && this._syncRes;
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