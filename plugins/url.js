const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd } = require("../command");

cmd({
  'pattern': "tourl",
  'alias': ["imgtourl", 'img2url', 'url'],
  'react': '🖇',
  'desc': "Convert an image to a URL using imgbb.",
  'category': 'utility',
  'use': ".tourl",
  'filename': __filename
}, async (client, message, args, options) => {
  const {
    from: chatId,
    quoted: quotedMessage,
    reply: replyFunction,
    sender: senderInfo
  } = options;
  
  try {
    const targetMessage = message.quoted ? message.quoted : message;
    const mimeType = (targetMessage.msg || targetMessage).mimetype || '';
    
    if (!mimeType || !mimeType.startsWith('image')) {
      throw "🌻 Please reply to an image.";
    }
    
    const imageBuffer = await targetMessage.download();
    const tempFilePath = path.join(os.tmpdir(), "Casey_xmd");
    fs.writeFileSync(tempFilePath, imageBuffer);
    
    const formData = new FormData();
    formData.append("image", fs.createReadStream(tempFilePath));
    
    const response = await axios.post("https://api.imgbb.com/1/upload?key=f07b8d2d9f0593bc853369f251a839de", formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    if (!response.data || !response.data.data || !response.data.data.url) {
      throw "❌ Failed to upload the file.";
    }
    
    const imageUrl = response.data.data.url;
    fs.unlinkSync(tempFilePath);
    
    const contextInfo = {
      'mentionedJid': [senderInfo],
      'forwardingScore': 999,
      'isForwarded': true,
      'forwardedNewsletterMessageInfo': {
        'newsletterJid': "120363302677217436@newsletter",
        'newsletterName': "𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒-𝐗𝐌𝐃",
        'serverMessageId': 143
      }
    };
    
    await client.sendMessage(chatId, {
      'text': `*Image Uploaded Successfully 📸*\nSize: ${imageBuffer.length} Byte(s)\n*URL:* ${imageUrl}\n\n>ᴜᴘʟᴏᴀᴅᴇᴅ ʙʏ ᴄᴀsᴇʏʀʜᴏᴅᴇs ᴛᴇᴄʜ 👻`,
      'contextInfo': contextInfo
    });
    
  } catch (error) {
    replyFunction("Error: " + error);
    console.error(error);
  }
});
