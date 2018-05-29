import { ITracker, NestedDictionary } from "./ITracker";
import container from "../../../config/inversify.config";
import { IStorage, IStorageSymbol } from "../../storage/IStorage";

export class TrackersDefaultObject {
  private _trackersDict: { [key: string]: ITracker } = {};
  private _uriDict: { [key: string]: string } = {};

  registerTracker(tracker: ITracker, name: string, ns: string): void {
    this._uriDict[ns] = name;
    this._trackersDict[name] = tracker;
  }

  getTrackerByName(name: string): ITracker {
    return this._trackersDict[name];
  }

  getTrackerByUri(uri: string): ITracker {
    return this.getTrackerByName(this.getNameByUri(uri));
  }

  getNameByUri(uri: string): string {
    return this._uriDict[uri];
  }

  async saveAuthInfo(): Promise<void> {
    const storage = container.get<IStorage>(IStorageSymbol);

    let saveObject: { [name: string]: NestedDictionary } = {};

    for (let tname in this._trackersDict) {
      let tracker = this.getTrackerByName(tname);

      saveObject[tname] = tracker.saveAuthentication();
    }

    await storage.set("trackerAuthInfo", saveObject);
  }

  async saveAuthInfoFor(name: string): Promise<void> {
    const storage = container.get<IStorage>(IStorageSymbol);

    let saveObject: { [name: string]: NestedDictionary } = (await storage.get("trackerAuthInfo")) || {};

    let tracker = this.getTrackerByName(name);

    saveObject[name] = tracker.saveAuthentication();

    await storage.set("trackerAuthInfo", saveObject);
  }

  async loadAuthInfo(): Promise<void> {
    const storage = container.get<IStorage>(IStorageSymbol);

    let loadObject: { [name: string]: NestedDictionary } = (await storage.get("trackerAuthInfo")) || {};

    for (let tname in this._trackersDict) {
      let tracker = this.getTrackerByName(tname);

      if (tname in loadObject)
        tracker.loadAuthentication(loadObject[tname]);
      else 
        tracker.loadAuthentication({});
    }
  }

  async loadAuthInfoFor(name: string): Promise<void> {
    const storage = container.get<IStorage>(IStorageSymbol);

    let loadObject: { [name: string]: NestedDictionary } = (await storage.get("trackerAuthInfo")) || {};

    if (name in loadObject) {
      let tracker = this.getTrackerByName(name);

      tracker.loadAuthentication(loadObject[name]);
    }
  }

  async authenticate(trackerName: string): Promise<void> {
    const storage = container.get<IStorage>(IStorageSymbol);

    await storage.set("authenticatedFlag", false);

    let tracker = this.getTrackerByName(trackerName);

    let resolve: () => void;
    let reject: (message: string) => void;
    let promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    let incrementer = 0;
    let intervalId = setInterval(async function() {
      if (incrementer > (10*60*1000)/200) {
        clearInterval(intervalId);

        return reject("Authentication timeout");
      }

      let isReady = await storage.get<boolean>("authenticatedFlag");

      if (isReady) { 
        clearInterval(intervalId);

        return resolve();
      }

      incrementer++;
    }, 200);

    window.open(tracker.authUri, "_blank");

    await promise;

    await this.loadAuthInfoFor(trackerName);
  }

  async sendAuthenticatedMessage(): Promise<void> {
    const storage = container.get<IStorage>(IStorageSymbol);

    await storage.set("authenticatedFlag", true);
  }
}

let defaultObj = new TrackersDefaultObject();
export default defaultObj;