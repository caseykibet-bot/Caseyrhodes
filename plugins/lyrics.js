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
  
  const encodedTitle = encodeURIComponent(songTitle);
  const apiUrl = "https://api.giftedtech.co.ke/api/search/lyrics?apikey=gifted&query=" + encodedTitle;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data.result || !data.result.lyrics || data.result.lyrics.length === 0) {
      return sendReply("❌ Lyrics not found.");
    }
    
    const {
      title: songTitle,
      artist: artistName,
      album: albumName,
      url: songUrl,
      lyrics: lyricsData
    } = data.result;
    
    // Generate image URL for the query
    const imageQuery = encodeURIComponent(`${songTitle} ${artistName} album cover`);
    const imageUrl = `https://source.unsplash.com/featured/300x300/?${imageQuery}`;
    
    let lyricsText = 
      "╔════════𝐋𝐘𝐑𝐈𝐂𝐒 📃═══════╗"
      + "\n\n"
      + "🎼 *Title:* " + songTitle + "  \n\n"
      + "🧖🏻‍♂ *Artist:* " + artistName + "  \n\n"
      + "💾 *Album:* " + albumName + "  \n\n"
      + "🔗 *Listen Here:* " + songUrl + "\n\n"
      + "🖼 *Image:* " + imageUrl + "\n\n"
      + "╟───────📃 *Lyrics:*───────╢"
      + "\n\n\n\n"
      + "> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ";
    
    for (const lyricSection of lyricsData) {
      if (lyricSection.type === "header") {
        lyricsText += "\n\n*" + lyricSection.text + "*\n";
      } else {
        lyricsText += lyricSection.text + "\n";
      }
    }
    
    await message.sendMessage(client.chat, {
      'text': lyricsText.trim(),
      'contextInfo': {
        'forwardingScore': 999,
        'isForwarded': true,
        'forwardedNewsletterMessageInfo': {
          'newsletterJid': '120363302677217436@newsletter',
          'newsletterName': "𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐋𝐘𝐑𝐈𝐂𝐒📃",
          'serverMessageId': 1
        }
      }
    }, {
      'quoted': client
    });
    
  } catch (error) {
    console.error("Lyrics error:", error);
    sendReply("❌ Failed to fetch lyrics. Try again later.");
  }
});
