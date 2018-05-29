import { executeQuery } from "./core";
import container from "../../../../config/inversify.config";
import { IStorage, IStorageSymbol } from "../../../storage/IStorage";
import { IAnime, ITracker, NestedDictionary } from "../ITracker";
import Trackers from "../Trackers";

const lookupQuery = `
query AnimeLookupQuery($name: String, $page: Int = 1, $perPage: Int = 10) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      hasNextPage
    }
    matches: media(search: $name, type: ANIME) {
      id
      title {
        romaji
        english
      }
      episodes
      userEntry: mediaListEntry {
        progress
        status
      }
    }
  }
}
`;

interface IAuthSerializer {
  key: string;
  expires_at: number;
  type: string;
}

export enum AnimeStatus {
  CURRENT = "Watching", 
  PLANNING = "Planning to watch", 
  COMPLETED = "Completed", 
  DROPPED = "Dropped", 
  PAUSED = "On-hold", 
  REPEATING = "Re-watching"
}

export interface IAnilistAnime extends IAnime {
  progress?: number;
  status?: AnimeStatus;
}

let authKey: string | null = null;
let authExpiryTime: Date = new Date();
let tokenType: string | undefined = undefined;
function setAuthKey(key: string, expiresIn: number, type: string) {
  authKey = key;
  authExpiryTime = new Date(Date.now() + expiresIn*1000);
  tokenType = type;
}

let defaultObj = new (class AniListTracker implements ITracker {

  get authUri(): string {
    let url = new URL("https://anilist.co/api/v2/oauth/authorize");
    url.searchParams.set('response_type', 'token');
    url.searchParams.set('client_id', '452'); 
    // this is my testing client ID; redirects to https://yeppha.github.io/crunchyroll-html5/auth?auth=anilist.co
    return url.toString();
  }

  loadAuthentication(saved: NestedDictionary): void {
    let object = <IAuthSerializer><any>saved;

    if (object === undefined) return;

    authKey = object.key;
    authExpiryTime = new Date(object.expires_at);
    tokenType = object.type;

    if (Date.now() > object.expires_at)
      Trackers.authenticate(trackerName);
  }

  saveAuthentication(): NestedDictionary {
    let object = {
      key: authKey,
      expires_at: authExpiryTime.getTime(),
      type: tokenType
    } as IAuthSerializer;
    return <NestedDictionary><any>object;
  }

  readOAuthFromURL(url: URL) {
    let tokenset = new URL("about:blank/?" + url.hash.substring(1)).searchParams;
    setAuthKey(tokenset.get("access_token")!, parseInt(tokenset.get('expires_in')!), tokenset.get('token_type')!)
  }

  async getAnime(name: string, perPage: number = 10): Promise<IAnilistAnime> {
    let anime: IAnilistAnime|undefined = undefined;
    let hasNextPage: boolean = true;
  
    for (let pageNo = 1; !anime && hasNextPage; pageNo++) {
      let response = await executeQuery(lookupQuery, {'name': name, 'page': pageNo, 'perPage': perPage}, authKey, tokenType);
  
      let page = response['Page'] as NestedDictionary;
      let pageInfo = page['pageInfo'] as NestedDictionary;
      let matches = page['matches'] as NestedDictionary[];
  
      hasNextPage = pageInfo['hasNextPage'] as boolean;
      
      for (let match of matches) {
        let mid = match['id'] as number;
        let episodes = match['episodes'] as number;
        let title = match['title'] as {romaji: string, english: string|null};
        let userEntry = match['userEntry'] as NestedDictionary | null;
  
        if (title.english) title.english = title.english!.toUpperCase();
  
        if (title.english === name.toUpperCase() 
            || title.romaji.toUpperCase() === name.toUpperCase()) {
          anime = {id:mid,episodes:episodes,name:title.romaji};
          if (userEntry) {
            anime.progress = userEntry['progress'] as number;
                        /* noImplicitAny workaround */
            anime.status = (AnimeStatus as any)[userEntry['status'] as string];
          }
          break;
        }
      }
    }
  
    if (anime)
      return anime;
    else
      throw new Error("Anime '" + name + "' could not be found on AniList");
  }
  
})();

export const trackerName = "AniList";
export const trackerUri = "anilist.co";
Trackers.registerTracker(defaultObj, trackerName, trackerUri);

export default defaultObj;