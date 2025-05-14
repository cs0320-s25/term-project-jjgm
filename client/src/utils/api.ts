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


// -- POINTS HANDLERS

export async function updatePoints(uid: string, genre: string, points: number) {
  const response = await fetch(`${HOST}/update-points`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: uid,
      genre: genre,
      points: points,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update points: ${response.statusText}`);
  }

  return await response.json();
}


export async function getUserPoints(uid: string) {
  const response = await fetch(`${HOST}/get-user-points`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: uid,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get user points: ${response.statusText}`);
  }

  return await response.json();
}

export async function getDormStats() {
  const response = await fetch(`${HOST}/get-dorm-stats`);
  
  if (!response.ok) {
    throw new Error(`Failed to get dorm stats: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function getDormPoints(dorm: string) {
  const response = await fetch(`${HOST}/get-dorm-points`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dorm: dorm,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get dorm points: ${response.statusText}`);
  }

  return await response.json();
}



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

export async function getGlobalLeaderboard(): Promise<any> {
  return await queryAPI("leaderboard/global", {});
}

export async function getDormLeaderboard(dormId: string): Promise<any> {
  return await queryAPI('leaderboard/dorm/${dormId}', {});
} 
