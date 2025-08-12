const { cmd } = require('../command');
const axios = require('axios');
const FormData = require('form-data');

cmd({
  pattern: "mediafire2",
  alias: ["mfire", "mf"],
  desc: "To download MediaFire files",
  react: "🎥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, quoted, q, reply }) => {
  try {
    if (!q) return reply("❌ Please provide a valid MediaFire link.\nExample: https://www.mediafire.com/file/abc123/file.pdf");

    // Validate URL format
    if (!q.match(/mediafire\.com\/file\/[a-z0-9]+\//i)) {
      return reply("❌ Invalid MediaFire link format. Please provide a valid link.");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    // Using a more reliable API endpoint
    const apiUrl = `https://api.bypass.vip/`;
    const form = new FormData();
    form.append('url', q);

    const response = await axios.post(apiUrl, form, {
      headers: form.getHeaders()
    });

    const data = response.data;

    if (!data || !data.success || !data.download) {
      return reply("⚠️ Failed to fetch download link. The file may be private or the link is invalid.");
    }

    const { download, filename, filesize } = data;
    const file_name = filename || "mediafire_download";
    const fileSizeMB = filesize ? (filesize / (1024 * 1024)).toFixed(2) + " MB" : "Unknown size";

    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    const caption = `╭━━━〔 *MEDIAFIRE DOWNLOADER* 〕━━━⊷\n` +
      `┃▸ *File Name:* ${file_name}\n` +
      `┃▸ *File Size:* ${fileSizeMB}\n` +
      `╰━━━⪼\n\n` +
      `📥 *Downloading your file...*`;

    // Send as document with progress tracking
    await conn.sendMessage(from, {
      document: { url: download },
      fileName: file_name,
      caption: caption,
      mimetype: 'application/octet-stream'
    }, { quoted: m });

  } catch (error) {
    console.error("MediaFire Download Error:", error);
    
    if (error.response) {
      // Handle API response errors
      if (error.response.status === 404) {
        reply("🔍 The file was not found. It may have been removed.");
      } else if (error.response.status === 403) {
        reply("🚫 Access forbidden. The file may be private or require a password.");
      } else {
        reply(`❌ API Error: ${error.response.status} - ${error.response.statusText}`);
      }
    } else if (error.request) {
      reply("⌛ The request timed out. Please try again later.");
    } else {
      reply("❌ An unexpected error occurred. Please try again.");
    }
  }
});
