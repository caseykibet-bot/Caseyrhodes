function hi() {
  console.log("Hello World!");
}
hi();

const {
  cmd,
  commands
} = require("../command");
const {
  fetchJson
} = require("../lib/functions");

cmd({
  'pattern': "logo",
  'desc': "Create logos",
  'react': '🎁',
  'category': 'other',
  'filename': __filename
}, async (message, match, m, {
  from,
  quoted,
  body,
  isCmd,
  command,
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
    if (!args[0]) {
      return reply("*_Please give me a text. Eg *.logo Mr CASEYRHODES_XMD*_*");
    }
    
    let menuText = `*🌟 CASEYRHODES-XMD LOGO MAKER 🌟*

╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼➻
*◈ᴛᴇxᴛ :* ${q}
╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼➻

*🔢 Rᴇᴘʟʏ Tʜᴇ Nᴜᴍʙᴇʀ Yᴏᴜ Wᴀɴᴛ ➠*

 1 ➠ Bʟᴀᴄᴋ Pɪɴᴋ
 2 ➠ Bʟᴀᴄᴋ Pɪɴᴋ 2
 3 ➠ Sɪʟᴠᴇʀ 3ᴅ
 4 ➠ Nᴀʀᴜᴛᴏ
 5 ➠ Dɪɢɪᴛᴀʟ Gʟɪᴛᴄʜ
 6 ➠ Pɪxᴇʟ Gʟɪᴛᴄʜ
 7 ➠ Cᴏᴍɪᴄ Sᴛʏʟᴇ
 8 ➠ Nᴇᴏɴ Lɪɢʜᴛ
 9 ➠ Fʀᴇᴇ Bᴇᴀʀ
10 ➠ Dᴇᴠɪʟ Wɪɴɢꜱ
11 ➠ Sᴀᴅ Gɪʀʟ
12 ➠ Lᴇᴀᴠᴇꜱ
13 ➠ Dʀᴀɢᴏɴ Bᴀʟʟ
14 ➠ Hᴀɴᴅ Wʀɪᴛᴛᴇɴ
15 ➠ Nᴇᴏɴ Lɪɢʜᴛ 
16 ➠ 3ᴅ Cᴀꜱᴛʟᴇ Pᴏᴘ
17 ➠ Fʀᴏᴢᴇɴ ᴄʀɪꜱᴛᴍᴀꜱꜱ
18 ➠ 3ᴅ Fᴏɪʟ Bᴀʟʟᴏɴꜱ
19 ➠ 3ᴓ Cᴏʟᴏᴜʀꜰᴜʟ Pᴀɪɴᴛ
20 ➠ Aᴍᴇʀɪᴄᴀɴ Fʟᴀɢ 3ᴅ

> © Gᴇɴᴇʀᴀᴛᴇᴅ Bʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs-xᴍᴅ ⚡`;
    
    const newsletterInfo = {
      'newsletterJid': "120363302677@newsletter",
      'newsletterName': "❄️ 𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐗𝐌𝐃 ❄️",
      'serverMessageId': 999
    };
    
    const contextInfo = {
      'mentionedJid': [m.sender],
      'forwardingScore': 999,
      'isForwarded': true,
      'forwardedNewsletterMessageInfo': newsletterInfo
    };
    
    const messageOptions = {
      'text': menuText,
      'contextInfo': contextInfo
    };
    
    let sentMessage = await message.sendMessage(from, messageOptions, {
      'quoted': match
    });
    
    message.ev.on("messages.upsert", async (data) => {
      const msg = data.messages[0];
      if (!msg.message || !msg.message.extendedTextMessage) {
        return;
      }
      
      const selectedOption = msg.message.extendedTextMessage.text.trim();
      
      if (msg.message.extendedTextMessage.contextInfo && 
          msg.message.extendedTextMessage.contextInfo.stanzaId === sentMessage.key.id) {
        
        let apiUrl;
        switch (selectedOption) {
          case '1':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html&name=" + q;
            break;
          case '2':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html&name=" + q;
            break;
          case '3':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html&name=" + q;
            break;
          case '4':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html&name=" + q;
            break;
          case '5':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html&name=" + q;
            break;
          case '6':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html&name=" + q;
            break;
          case '7':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html&name=" + q;
            break;
          case '8':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html&name=" + q;
            break;
          case '9':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-bear-logo-maker-online-673.html&name=" + q;
            break;
          case '10':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html&name=" + q;
            break;
          case '11':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-text-on-wet-glass-online-589.html&name=" + q;
            break;
          case '12':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-typography-status-online-with-impressive-leaves-357.html&name=" + q;
            break;
          case '13':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html&name=" + q;
            break;
          case '14':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html&name=" + q;
            break;
          case '15':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html&name=" + q;
            break;
          case '16':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-3d-castle-pop-out-mobile-photo-effect-786.html&name=" + q;
            break;
          case '17':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html&name=" + q;
            break;
          case '18':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html&name=" + q;
            break;
          case '19':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html&name=" + q;
            break;
          case '20':
            apiUrl = "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html&name=" + q;
            break;
          default:
            return reply("*_Invalid number.Please reply a valid number._*");
        }
        
        try {
          let result = await fetchJson(apiUrl);
          await message.sendMessage(from, {
            'image': {
              'url': result.result.download_url
            },
            'caption': "> © Gᴇɴᴇʀᴀᴛᴇᴅ Bʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs-xᴍᴅ ⚡"
          }, {
            'quoted': match
          });
        } catch (error) {
          console.log(error);
          reply('Error generating logo: ' + error);
        }
      }
    });
  } catch (error) {
    console.log(error);
    reply('' + error);
  }
});
