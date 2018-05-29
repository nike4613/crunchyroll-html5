export type JsonAnyNonArray = NestedDictionary | string | number | boolean | null;
export type JsonAny = JsonAnyNonArray | JsonAnyNonArray[];
export type NestedDictionary = { [key: string]: JsonAny };
export type VariableDict = { [variable: string]: JsonAnyNonArray; };

export interface IAnime {
  name: string;
  id: number;
  episodes: number;
}

export interface ITracker {
  authUri: string;
  loadAuthentication(saved: NestedDictionary): void;
  saveAuthentication(): NestedDictionary;
  readOAuthFromURL(url: URL): void;
  getAnime(name: string): Promise<IAnime>;
}