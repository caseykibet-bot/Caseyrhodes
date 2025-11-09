const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd, commands } = require("../command");

cmd({
  'pattern': "tourl",
  'alias': ["imgtourl", "imgurl", "url", "geturl", "upload"],
  'react': '✅',
  'desc': "Convert media to Catbox URL",
  'category': "utility",
  'use': ".tourl [reply to media]",
  'filename': __filename
}, async (client, message, args, { reply }) => {
  try {
    // Check if quoted message exists and has media
    const quotedMsg = message.quoted ? message.quoted : message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    
    if (!mimeType) {
      throw "Please reply to an image, video, or audio file";
    }

    // Download the media
    const mediaBuffer = await quotedMsg.download();
    const tempFilePath = path.join(os.tmpdir(), `catbox_upload_${Date.now()}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Get file extension based on mime type
    let extension = '';
    if (mimeType.includes('image/jpeg')) extension = '.jpg';
    else if (mimeType.includes('image/png')) extension = '.png';
    else if (mimeType.includes('video')) extension = '.mp4';
    else if (mimeType.includes('audio')) extension = '.mp3';
    
    const fileName = `file${extension}`;

    // Prepare form data for Catbox
    const form = new FormData();
    form.append('fileToUpload', fs.createReadStream(tempFilePath), fileName);
    form.append('reqtype', 'fileupload');

    // Upload to Catbox
    const response = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    });

    if (!response.data) {
      throw "Error uploading to Catbox";
    }

    const mediaUrl = response.data;
    fs.unlinkSync(tempFilePath);

    // Determine media type for response
    let mediaType = 'File';
    if (mimeType.includes('image')) mediaType = 'Image';
    else if (mimeType.includes('video')) mediaType = 'Video';
    else if (mimeType.includes('audio')) mediaType = 'Audio';

    // Verification contact
    const verifiedContact = {
        key: {
            fromMe: false,
            participant: `0@s.whatsapp.net`,
            remoteJid: "status@broadcast"
        },
        message: {
            contactMessage: {
                displayName: "CASEYRHODES VERIFIED ✅",
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:CASEYRHODES VERIFIED ✅\nORG:CASEYRHODES-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=13135550002:+1 313-555-0002\nEND:VCARD`
            }
        }
    };

    // Enhanced context info with newsletter and external ad reply
    const contextInfo = {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363420261263259@newsletter',
            newsletterName: 'CASEYRHODES TECH 🌟',
            serverMessageId: -1
        },
        externalAdReply: {
            title: "CASEYRHODES VERIFIED ✅",
            body: "Media Upload Service",
            mediaType: 1,
            thumbnailUrl: mediaUrl, // Use the uploaded image URL as thumbnail
            sourceUrl: "https://whatsapp.com/channel/0029Va9aJNY6LtL5wM5pY3z",
            mediaUrl: mediaUrl
        }
    };

    // Create the status message with enhanced formatting
    const status = `
╭───❮ *MEDIA UPLOADER* ❯───⊷
┃ 📁 *Type:* ${mediaType}
┃ 💾 *Size:* ${formatBytes(mediaBuffer.length)}
┃ 🔗 *URL:* ${mediaUrl}
╰──────────────────────⊷
    `.trim();

    // Send response with verification and newsletter
    await client.sendMessage(message.chat, { 
      image: { 
        url: "https://i.ibb.co/gKnBmq8/casey.jpg"
      },  
      caption: status,
      contextInfo: contextInfo
    }, { 
      quoted: verifiedContact 
    });

    // Send success reaction
    await client.sendMessage(message.chat, {
      react: {
        text: '✅',
        key: message.key
      }
    });

  } catch (error) {
    console.error(error);
    
    // Send error reaction
    await client.sendMessage(message.chat, {
      react: {
        text: '❌',
        key: message.key
      }
    });
    
    await reply(`❌ Error: ${error.message || error}\n\nPlease try again or contact support.`);
  }
});

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Add command info
commands.info({
  'pattern': "tourl",
  'desc': "Upload media to Catbox and get shareable URL",
  'category': "utility",
  'example': ".tourl [reply to media]",
  'credit': "CASEYRHODES TECH"
});
