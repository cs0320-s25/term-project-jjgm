const HOST = "http://localhost:3232";

async function queryAPI(
  endpoint: string,
  query_params: Record<string, string>
) {
  // query_params is a dictionary of key-value pairs that gets added to the URL as query parameters
  // e.g. { foo: "bar", hell: "o" } becomes "?foo=bar&hell=o"
  const paramsString = new URLSearchParams(query_params).toString();
  const url = `${HOST}/${endpoint}?${paramsString}`;
  console.log("API Request URL:", url);



  const response = await fetch(url);
  if (!response.ok) {
    console.error(response.status, response.statusText);
  }
  return response.json();
}

export async function addPin(uid: string, pinId: string, lat: number, lng: number, timestamp: number) {
  console.log("Calling add-pin API with:", { uid, id: pinId, lat, lng, timestamp });
  return await queryAPI("add-pin", {
    uid: uid,
    id: pinId,
    lat: lat.toString(),
    lng: lng.toString(),
    timestamp: timestamp.toString()
  });
}

export async function listPins() {
  console.log("Calling list-pins API");
  return await queryAPI("list-pins", {});
}

export async function clearUserPins(uid: string) {
  console.log("Calling clear-pins API with uid:", uid);
  return await queryAPI("clear-pins", {
    uid: uid
  });
}

export async function addWord(uid: string, word: string) {
  return await queryAPI("add-word", {
    uid: uid,
    word: word,
  });
}

export async function getWords(uid: string) {
  return await queryAPI("list-words", {
    uid: uid,
  });
}

export async function clearUser(uid: string) {
  return await queryAPI("clear-user", {
    uid: uid,
  });
}
