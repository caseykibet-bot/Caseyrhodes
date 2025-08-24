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
    // Show waiting message
    await message.sendMessage(message.chat, { 
      text: "🔍 Searching for lyrics..." 
    }, { 
      quoted: message 
    });
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data.result || !data.result.lyrics || data.result.lyrics.length === 0) {
      return sendReply("❌ Lyrics not found.");
    }
    
    const {
      title: songTitleResult,
      artist: artistName,
      album: albumName,
      url: songUrl,
      lyrics: lyricsData,
      image: imageUrl // Check if API returns an image
    } = data.result;
    
    // Build lyrics text
    let lyricsText = "╔════════𝐋𝐘𝐑𝐈𝐂𝐒 📃═══════╗" +
      "\n\n" +
      "🎼 *Title:* " + songTitleResult + "  \n\n" +
      "🧖🏻‍♂ *Artist:* " + artistName + "  \n\n" +
      "💾 *Album:* " + (albumName || "Unknown") + "  \n\n" +
      "🔗 *Listen Here:* " + songUrl + "\n\n" +
      "╟───────📃 *Lyrics:*───────╢" +
      "\n\n";
    
    // Process lyrics sections
    for (const lyricSection of lyricsData) {
      if (lyricSection.type === "header") {
        lyricsText += "\n\n*" + lyricSection.text + "*\n";
      } else {
        lyricsText += lyricSection.text + "\n";
      }
    }
    
    lyricsText += "\n\n> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ";
    
    // If we have an image URL from the API, send image with caption
    if (imageUrl) {
      try {
        // Download the image
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.buffer();
        
        // Send image with lyrics as caption
        await client.sendMessage(message.chat, {
          image: imageBuffer,
          caption: lyricsText.trim(),
          mimetype: 'image/jpeg'
        }, {
          quoted: message
        });
        return;
      } catch (imgError) {
        console.error("Image error:", imgError);
        // Fall back to text only if image fails
      }
    }
    
    // If no image or image failed, send text only
    await client.sendMessage(message.chat, {
      text: lyricsText.trim()
    }, {
      quoted: message
    });
    
  } catch (error) {
    console.error("Lyrics error:", error);
    sendReply("❌ Failed to fetch lyrics. Try again later.");
  }
});
