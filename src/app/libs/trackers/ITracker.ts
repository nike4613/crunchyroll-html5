export interface IAnime {
  name: string;
  id: number;
  episodes: number;
}

export interface ITracker {
  authUri: string;
  loadAuthentication(): Promise<void>;
  saveAuthentication(): Promise<void>;
  readOAuthFromURL(url: URL): void;
  getAnime(name: string): Promise<IAnime>;
}