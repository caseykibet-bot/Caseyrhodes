const {
  cmd
} = require("../command");
const fetch = require("node-fetch");

cmd({
  'pattern': 'lyrics',
  'alias': ["lyric"],
  'desc': "Get song lyrics from Genius",
  'category': "music",
  'use': "<song title>"
}, async (message, client, args, {
  text: songTitle,
  prefix: userPrefix,
  command: userCommand,
  reply: sendReply
}) => {
  if (!songTitle) {
    return sendReply("Please provide a song title.\nExample: *" + (userPrefix + userCommand) + " robbery*");
  }
  
  try {
    const encodedTitle = encodeURIComponent(songTitle);
    const apiUrl = `https://api.giftedtech.co.ke/api/search/lyrics?apikey=gifted&query=${encodedTitle}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data.result || !data.result.lyrics) {
      return sendReply("❌ Lyrics not found.");
    }
    
    const result = data.result;
    let lyricsText = `🎵 *${result.title || "Unknown"}* - ${result.artist || "Unknown Artist"}\n\n`;
    
    if (result.lyrics && Array.isArray(result.lyrics)) {
      for (const section of result.lyrics) {
        lyricsText += section.text + "\n\n";
      }
    }
    
    lyricsText += `\n🔗 ${result.url || ""}\n\n> Powered by CaseyRhodes Tech`;
    
    await client.sendMessage(message.chat, {
      text: lyricsText
    }, {
      quoted: message
    });
    
  } catch (error) {
    console.error("Lyrics error:", error);
    sendReply("❌ Failed to fetch lyrics. Try again later.");
  }
});
