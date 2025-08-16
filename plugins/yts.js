const { cmd, commands } = require("../command");
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
}, async (message, client, args, {
  from,
  l: logger,
  quoted,
  body,
  isCmd,
  umarmd,
  args: cmdArgs,
  q: query,
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
    if (!query) {
      return reply("*Please give me words to search*");
    }
    
    try {
      let ytSearch = require('yt-search');
      var searchResults = await ytSearch(query);
    } catch (error) {
      logger(error);
      return await client.sendMessage(from, {
        'text': "*Error !!*"
      }, {
        'quoted': message
      });
    }
    
    var resultText = '';
    searchResults.all.map(video => {
      resultText += ` *🖲️${video.title}*\n🔗 ${video.url}\n\n`;
    });
    
    await client.sendMessage(from, {
      'text': resultText
    }, {
      'quoted': message
    });
  } catch (error) {
    logger(error);
    reply("*Error !!*");
  }
});
