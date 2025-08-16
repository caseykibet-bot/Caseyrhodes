const { cmd } = require("../command");
const yts = require('yt-search');

cmd({
  'pattern': "yts",
  'alias': ['ytsearch'],
  'use': ".yts query",
  'react': '🎶',
  'desc': "Search and get details from YouTube",
  'category': 'search',
  'filename': __filename
}, async (message, client, match) => {
  try {
    if (!match) return await message.reply("*Please provide a search query!*\nExample: .yts Never Gonna Give You Up");

    // Search YouTube
    const searchResults = await yts(match);
    if (!searchResults.all || searchResults.all.length === 0) {
      return await message.reply("*No results found for your query!*");
    }

    // Format results
    let resultText = "🎵 *YouTube Search Results* 🎵\n\n";
    searchResults.all.slice(0, 5).forEach((video, index) => {
      resultText += `*${index + 1}. ${video.title}*\n`;
      resultText += `🔗 ${video.url}\n`;
      resultText += `⏱️ ${video.timestamp || 'N/A'}\n`;
      resultText += `👀 ${video.views || 'N/A'} views\n\n`;
    });

    // Send message with image and newsletter info
    await client.sendMessage(message.chat, {
      image: { url: "https://files.catbox.moe/y3j3kl.jpg" },
      caption: resultText + "\n📩 *Subscribe to our newsletter for updates!*",
      contextInfo: {
        mentionedJid: [message.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363302677217436@newsletter',
          newsletterName: '𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐓𝐄𝐂𝐇 🌟',
          serverMessageId: 143
        }
      }
    }, { quoted: message });

  } catch (error) {
    console.error('YouTube search error:', error);
    await message.reply("*An error occurred while searching YouTube. Please try again later.*");
  }
});
