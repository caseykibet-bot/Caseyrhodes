const { cmd } = require("../command");
const axios = require("axios");

cmd({
  'pattern': "lyrics",
  'alias': ["lyric", "songlyrics"],
  'react': '🎶',
  'desc': "Search for song lyrics",
  'category': "media",
  'use': "<song name and artist>",
  'filename': __filename
}, async (message, client, context, {
  from: sender,
  q: query,
  reply: replyFunction
}) => {
  try {
    if (!query) {
      return replyFunction(
        '🎶 *Please provide a song name and artist...*\n\n' +
        'Example: *.lyrics not afraid Eminem*\n' +
        'Example: *.lyrics shape of you Ed Sheeran*'
      );
    }

    // Send searching message
    await message.sendMessage(sender, {
      'text': "🔍 Searching for lyrics..."
    }, {
      'quoted': client
    });

    const apiURL = `https://lyricsapi.fly.dev/api/lyrics?q=${encodeURIComponent(query)}`;
    const res = await axios.get(apiURL);
    const data = res.data;

    if (!data.success || !data.result || !data.result.lyrics) {
      return replyFunction(
        '❌ *Lyrics not found for the provided query.*\n\n' +
        'Please check the song name and artist spelling.'
      );
    }

    const { title, artist, image, link, lyrics } = data.result;
    const shortLyrics = lyrics.length > 4096 ? lyrics.slice(0, 4093) + '...' : lyrics;

    const caption =
      `╭───❮ *CASEYRHODES LYRICS* ❯────⊷\n` +
      `┃ 🎵 *Title:* ${title}\n` +
      `┃ 👤 *Artist:* ${artist}\n` +
      `┃ 🔗 *Link:* ${link}\n` +
      `╰──────────────────────⊷\n\n` +
      `📜 *Lyrics:*\n\n` +
      `${shortLyrics}\n\n` +
      `> *Powered by Caseyrhodes tech♡*`;

    // Send lyrics with image
    await message.sendMessage(sender, {
      'image': {
        'url': image
      },
      'caption': caption
    }, {
      'quoted': client
    });

    // Send success reaction
    await message.sendMessage(sender, {
      'react': {
        'text': '✅',
        'key': client.key
      }
    });

  } catch (error) {
    console.error("Lyrics command error:", error);
    replyFunction(
      '❌ *An error occurred while fetching lyrics!*\n\n' +
      'Please try again later or check your internet connection.'
    );
    
    // Send error reaction
    await message.sendMessage(sender, {
      'react': {
        'text': '❌',
        'key': client.key
      }
    });
  }
});
