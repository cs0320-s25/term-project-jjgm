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
  console.log("calling add-pin API with:", { uid, id: pinId, lat, lng, timestamp });
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

export async function searchAreas(keyword: string) {
  return await queryAPI("search-areas", {
    keyword: keyword
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

// export async function saveUserProfile(uid: string, profile: { nickname: string; dorm: string }) {
//   return await queryAPI("save-profile", {
//     uid: uid,
//     nickname: profile.nickname,
//     dorm: profile.dorm,
//   });
// }



// export async function getUserProfile(uid: string) {
//   const result = await queryAPI("get-profile", {
//     uid,
//   });
//   if (result.response_type === "success") {
//     return result.profile;
//   }
//   return null;
// }


export async function saveUserProfile(
  uid: string,
  profile: { nickname: string; dorm: string }
) {
  const response = await fetch(`${HOST}/save-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: uid,
      nickname: profile.nickname,
      dorm: profile.dorm,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save profile: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.response_type !== "success") {
    throw new Error(`Error: ${data.error}`);
  }

  return data.profile;
}

export async function getUserProfile(uid: string) {
  const response = await fetch(`${HOST}/get-profile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: uid }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get profile: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.response_type === "success") {
    return result.profile;
  }
  return null;
}

/**
 * Fetch the top 10 global leaderboard entries.
 */
export async function getGlobalLeaderboard() {
  // matches Spark.get("/leaderboard/global", …)
  return await queryAPI("leaderboard/global", {});
}

/**
 * Fetch the top 10 leaderboard entries for a given dorm.
 */
export async function getDormLeaderboard(dormId: string) {
  // matches Spark.get("/leaderboard/dorm/:dormId", …)
  return await queryAPI(`leaderboard/dorm/${dormId}`, {});
}
