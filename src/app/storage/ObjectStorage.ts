import { injectable, inject } from "inversify";
import { IStorage } from "./IStorage";
import { IMechanismSymbol, IMechanism } from "./mechanism/IMechanism";
import { StorageError } from "./StorageError";


@injectable()
export class ObjectStorage implements IStorage {
  constructor(
    @inject(IMechanismSymbol) protected _mechanism: IMechanism
  ) {}

  /**
   * Set the value of key.
   * @param key the key of the value to be set.
   * @param value the value to be set.
   */
  async set(key: string, value: any): Promise<void> {
    if (value === undefined) {
      return await this._mechanism.remove(key);
    }
    await this._mechanism.set(key, value);
  }

  /**
   * Returns the value with key.
   * @param key the key of the value.
   */
  async get(key: string): Promise<any> {
    return await this._mechanism.get(key);
  }

  /**
   * Removes the value with key.
   * @param key 
   */
  async remove(key: string): Promise<void> {
    await this._mechanism.remove(key);
  }
}