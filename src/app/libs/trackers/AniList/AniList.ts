import { executeQuery, NestedDictionary, JsonAnyNonArray, } from "./core";
import container from "../../../../config/inversify.config";
import { IStorage, IStorageSymbol } from "../../../storage/IStorage";
import { IAnime, ITracker } from "../ITracker";

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

export const authUri = ((): string => {
  let url = new URL("https://anilist.co/api/v2/oauth/authorize");
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('client_id', '452'); // this is my testing client ID; redirects to https://yeppha.github.io/crunchyroll-html5/auth?auth=anilist.co
  //url.searchParams.set('redirect_uri','about:blank/?source=anilist');
  return url.toString();
})();

interface IAuthSerializer {
  key: string;
  expires_at: number;
  type: string;
}
export async function loadAuthInfo() {
  const storage = container.get<IStorage>(IStorageSymbol);

  let object = await storage.get<IAuthSerializer>("anilistAuthInfo");

  if (object === undefined) return;

  authKey = object.key;
  authExpiryTime = new Date(object.expires_at);
  tokenType = object.type;
}
export async function saveAuthInfo() {
  const storage = container.get<IStorage>(IStorageSymbol);

  let object = {
    key: authKey,
    expires_at: authExpiryTime.getTime(),
    type: tokenType
  } as IAuthSerializer;

  await storage.set("anilistAuthInfo", object);
}

let authKey: string | null = null;
let authExpiryTime: Date = new Date();
let tokenType: string | undefined = undefined;
export function setAuthKey(key: string, expiresIn: number, type: string) {
  authKey = key;
  authExpiryTime = new Date(Date.now() + expiresIn*1000);
  tokenType = type;

  saveAuthInfo();
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

export async function getAnime(name: string, perPage: number = 10): Promise<IAnilistAnime> {
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

export default {
  authUri: authUri,
  loadAuthentication: loadAuthInfo,
  saveAuthentication: saveAuthInfo,
  readOAuthFromURL: function(url: URL) {
    let tokenset = new URL("about:blank/?" + url.hash.substring(1)).searchParams;
    setAuthKey(tokenset.get("access_token")!, parseInt(tokenset.get('expires_in')!), tokenset.get('token_type')!)
  },
  getAnime: getAnime
} as ITracker;