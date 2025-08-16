const {
  cmd
} = require("../command");
const {
  ytsearch
} = require("@dark-yasiya/yt-dl.js");

cmd({
  'pattern': "videomp4",
  'alias': ["mp4v", "videomp4"],
  'react': '🎬',
  'desc': "Download YouTube video",
  'category': "main",
  'use': ".video <query>",
  'filename': __filename
}, async (message, match, client, { from, sender, reply, q }) => {
  try {
    if (!q) {
      return reply("Please provide a video name or YouTube link.");
    }
    const searchResults = await ytsearch(q);
    if (!searchResults.results.length) {
      return reply("No results found!");
    }
    const video = searchResults.results[0];
    const apiUrl = "https://apis.davidcyriltech.my.id/youtube/mp4?url=" + encodeURIComponent(video.url);
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!data?.result?.downloadUrl) {
      return reply("Download failed. Try again later.");
    }

    let caption = `\n╭━━━━━━━━━━━━━━━━⊷\n┊ ┏────────────⊷\n┊ ┊ 🎬ᴛɪᴛʟᴇ : *${video.title}.mp4*\n┊ ┗────────────⊷\n╰┬━━━━━━━━━━━━⊷⳹\n┌┤ *📥(ᴀᴜᴛᴏᴍᴀᴛɪᴄ sᴇɴᴅ ᴠɪᴅᴇᴏ)*\n┊╰─────────────⊷\n*╰━━━━━━━━━━━━━━━━⊷*`;

    await message.sendMessage(from, {
      'image': {
        'url': video.thumbnail.replace("default.jpg", "hqdefault.jpg")
      },
      'caption': caption,
      'contextInfo': {
        'mentionedJid': [sender],
        'forwardingScore': 999,
        'isForwarded': true,
        'forwardedNewsletterMessageInfo': {
          'newsletterJid': "120363399999197102@newsletter",
          'newsletterName': "╭••➤®Njabulo Jb",
          'serverMessageId': 143
        }
      }
    }, {
      'quoted': {
        'key': {
          'fromMe': false,
          'participant': "0@s.whatsapp.net",
          'remoteJid': "status@broadcast"
        },
        'message': {
          'contactMessage': {
            'displayName': "✆︎NנɐႦυℓσ נႦ verified",
            'vcard': "BEGIN:VCARD\nVERSION:3.0\nN:Njabulo-Jb;BOT;;;\nFN:Njabulo-Jb\nitem1.TEL;waid=254700000000:+254 700 000000\nitem1.X-ABLabel:Bot\nEND:VCARD"
          }
        }
      }
    });

    await message.sendMessage(from, {
      'video': {
        'url': data.result.downloadUrl
      },
      'mimetype': "video/mp4",
      'caption': video.title + ".mp4"
    }, {
      'quoted': {
        'key': {
          'fromMe': false,
          'participant': "0@s.whatsapp.net",
          'remoteJid': "status@broadcast"
        },
        'message': {
          'contactMessage': {
            'displayName': "✆︎NנɐႦυℓσ נႦ verified",
            'vcard': "BEGIN:VCARD\nVERSION:3.0\nN:Njabulo-Jb;BOT;;;\nFN:Njabulo-Jb\nitem1.TEL;waid=254700000000:+254 700 000000\nitem1.X-ABLabel:Bot\nEND:VCARD"
          }
        }
      }
    });

  } catch (error) {
    console.error(error);
    reply("An error occurred. Please try again.");
  }
});
