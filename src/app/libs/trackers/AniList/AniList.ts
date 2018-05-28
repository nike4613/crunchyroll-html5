import { executeQuery, NestedDictionary } from "./core";

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
    }
  }
}
`;

export const authUri = ((): string => {
  let url = new URL("https://anilist.co/api/v2/oauth/authorize");
  url.searchParams.set('response_type', 'token');
  url.searchParams.set('client_id', '452'); // this is my testing client ID
  //url.searchParams.set('redirect_uri','about:blank/?source=anilist');
  return url.toString();
})();

let authKey: string|null = null;
export function setAuthKey(key: string) {
  authKey = key;
}

export async function getAnimeID(name: string, perPage: number = 10): Promise<number> {
  let id: number|undefined = undefined;
  let hasNextPage: boolean = true;

  for (let pageNo = 1; !id && hasNextPage; pageNo++) {
    let response = await executeQuery(lookupQuery, {'name': name, 'page': pageNo, 'perPage': perPage}, authKey);

    let page = response['Page'] as NestedDictionary;
    let pageInfo = page['pageInfo'] as NestedDictionary;
    let matches = page['matches'] as NestedDictionary[];

    hasNextPage = pageInfo['hasNextPage'] as boolean;
    
    for (let match of matches) {
      let mid = match['id'] as number;
      let title = match['title'] as {romaji: string, english: string|null};

      if (title.english) title.english = title.english!.toUpperCase();

      if (title.english === name.toUpperCase() 
          || title.romaji.toUpperCase() === name.toUpperCase()) {
        id = mid;
        break;
      }
    }
  }

  if (id)
    return id;
  else
    throw new Error("Anime '" + name + "' could not be found on AniList");
}