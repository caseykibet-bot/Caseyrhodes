const {
  cmd,
  commands
} = require("../command");
const {
  getBuffer,
  getGroupAdmins,
  getRandom,
  h2k,
  isUrl,
  Json,
  runtime,
  sleep,
  fetchJson
} = require('../lib/functions');

cmd({
  'pattern': "yts",
  'alias': ['ytsearch'],
  'use': ".yts jawad bahi",
  'react': '🎶',
  'desc': "Search and get details from youtube.",
  'category': 'search',
  'filename': __filename
}, async (m, sock, _, {
  from,
  l,
  quoted,
  body,
  isCmd,
  umarmd,
  args,
  q,
  isGroup,
  sender,
  senderNumber,
  botNumber2,
  botNumber,
  pushname,
  isMe,
  isOwner,
  groupMetadata,
  groupName,
  participants,
  groupAdmins,
  isBotAdmins,
  isAdmins,
  reply
}) => {
  try {
    if (!q) {
      return reply("*Please give me words to search*");
    }
    
    try {
      let yts = require('yt-search');
      var searchResults = await yts(q);
    } catch (err) {
      l(err);
      return await m.sendMessage(from, {
        'text': "*Error occurred while searching!*"
      }, {
        'quoted': sock
      });
    }
    
    var resultText = '';
    searchResults.all.map(item => {
      resultText += `🎵 *${item.title}*\n🔗 ${item.url}\n\n`;
    });

    // Send the YouTube search results along with newsletter info
    await sock.sendMessage(from, { 
      image: { url: `https://files.catbox.moe/y3j3kl.jpg` },  
      caption: `*YouTube Search Results*\n\n${resultText}\n\n_🔔 𝐂𝐚𝐬𝐞𝐲𝐫𝐡𝐨𝐝𝐞𝐬 𝐭𝐞𝐜𝐡_`,
      contextInfo: {
        mentionedJid: [quoted?.sender || sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363302677217436@newsletter',
          newsletterName: '𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐓𝐄𝐂𝐇 🌟',
          serverMessageId: 143
        }
      }
    }, { quoted: sock });

  } catch (error) {
    l(error);
    reply("*An error occurred while processing your request*");
  }
});
