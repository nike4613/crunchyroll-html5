

const queryUri = 'https://graphql.anilist.co';

export type JsonAnyNonArray = NestedDictionary | string | number | boolean | null;
export type JsonAny = JsonAnyNonArray | JsonAnyNonArray[];
export type NestedDictionary = { [key: string]: JsonAny };
export type VariableDict = { [variable: string]: JsonAnyNonArray; };

function createRequestInit(query: string, variables: VariableDict, authKey: string|null = null): RequestInit {
  let options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }, 
    body: JSON.stringify({
      query: query,
      variables: variables
    })
  };

  if (authKey !== null) {
                      /* this really shouldn't need to be here */
    (options.headers! as { [key: string]: string })['Authorization'] = "Bearer " + authKey;
  }

  return options;
}

interface IGraphQLError {
  message: string;
  status: number;
  locations: {
    line: number;
    column: number;
  }[];
  validation?: { [key: string]: string[] };
}

interface IGraphQLResponse {
  data: { [key: string]: any }; // pending more complex typing
  errors?: IGraphQLError[];
}

export async function executeQuery(query: string, vars: VariableDict, authKey: string|null = null): Promise<NestedDictionary> {
  let response = await fetch(queryUri, createRequestInit(query, vars, authKey));
  let json = await response.json() as IGraphQLResponse; // because usually the response will still be JSON
  if (!response.ok) { // make sure this succeeded
    if (response.status != 400) // anything but a request error
      throw new Error("An error occurred when querying AniList: " + response.status + response.statusText);
    
    // generate error message
    let errorStr = "The following errors occurred:\n";

    for (let error of json.errors!) {
      let errorPart = "'" + error.message + "' at ";

      for (let location of error.locations)
        errorPart += "(" + location.line + ":" + location.column + ") ";
      if (error.validation) 
        for (let validationKey in error.validation!) {
          errorPart += "  " + validationKey + ": ";

          for (let message of error.validation![validationKey]) 
            errorPart += message + "; ";
        }
      
      errorStr += errorPart + "\n";
    }

    throw new Error(errorStr);
  }

  // process response JSON
  return json.data;
}