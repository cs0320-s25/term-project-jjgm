import fetch from 'node-fetch';
import { writeFileSync } from 'fs';
import { mkdirSync, existsSync } from 'fs';

const playlistsByGenre = {
  Pop: '2098157264',
  NintyRnb: '5014738124',
  Afrobeats: '3153080842',
  Hiphop: '1677006641',
  Country: '1130102843'
};

const outputDir = 'client/src/catalog';

async function fetchTracksFromPlaylist(playlistId, genre) {
  const res = await fetch(`https://api.deezer.com/playlist/${playlistId}`);
  const data = await res.json();

  if (!data.tracks || !data.tracks.data) {
    console.warn(`⚠️ No tracks found for genre: ${genre}`);
    return [];
  }

  return data.tracks.data
    .filter(track => track.preview)
    .map(track => ({
      trackID: track.id,
      title: track.title,
      artist: track.artist.name,
      // preview_url: track.preview
    }));
}

(async () => {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  for (const [genre, playlistId] of Object.entries(playlistsByGenre)) {
    console.log(`🔍 Fetching ${genre} tracks...`);
    const tracks = await fetchTracksFromPlaylist(playlistId, genre);

    const filePath = `${outputDir}/${genre}.json`;
    writeFileSync(filePath, JSON.stringify(tracks, null, 2));

    console.log(`✅ Saved ${tracks.length} ${genre} tracks to ${filePath}`);
  }

  console.log("🎉 All genre catalogs saved!");
})();
