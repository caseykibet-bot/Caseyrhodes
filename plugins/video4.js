const { cmd } = require("../command");
const { ytsearch } = require("@dark-yasiya/yt-dl.js");

// Video Downloader 1
const video1 = {
  pattern: "mp5",
  alias: ["video"],
  react: "🐦‍🔥",
  desc: "Download YouTube video",
  category: "main",
  use: ".song <Yt url or Name>",
  filename: __filename
};

cmd(video1, async (client, message, args, { from, prefix, quoted, q, reply }) => {
  try {
    if (!q) {
      return await reply("Please provide a YouTube URL or video name.");
    }

    const searchResults = await ytsearch(q);
    if (searchResults.results.length < 1) {
      return reply("No results found!");
    }

    let video = searchResults.results[0];
    let apiUrl = "https://apis.davidcyriltech.my.id/download/ytmp4?url=" + encodeURIComponent(video.url);
    let response = await fetch(apiUrl);
    let data = await response.json();

    if (data.status !== 200 || !data.success || !data.result.download_url) {
      return reply("Failed to fetch the video. Please try again later.");
    }

    let caption = `🎬 *CASEYRHODES XMD VIDEO DOWNLOADER* 🎬\n\n📌 *Title:* ${video.title}\n⏱️ *Duration:* ${video.timestamp}\n👁️ *Views:* ${video.views}\n👤 *Author:* ${video.author.name}\n🔗 *Link:* ${video.url}`;

    await client.sendMessage(from, {
      image: { url: data.result.thumbnail || '' },
      caption: caption
    }, { quoted: message });

    await client.sendMessage(from, {
      video: { url: data.result.download_url },
      mimetype: "video/mp4"
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("An error occurred. Please try again later.");
  }
});

// Video Downloader 2
const video2 = {
  pattern: "video2",
  alias: ["video3", "video5"],
  react: "🤩",
  desc: "Download YouTube video",
  category: "main",
  use: ".song <Yt url or Name>",
  filename: __filename
};

cmd(video2, async (client, message, args, { from, prefix, quoted, q, reply }) => {
  try {
    if (!q) {
      return await reply("❌ *Please provide a YouTube URL or video name.*");
    }

    const searchResults = await ytsearch(q);
    if (searchResults.results.length < 1) {
      return reply("⚠️ *No results found!*");
    }

    let video = searchResults.results[0];
    let apiUrl = "https://api.siputzx.my.id/api/d/ytmp4?url=" + encodeURIComponent(video.url);
    let response = await fetch(apiUrl);
    let data = await response.json();

    if (!data.status || !data.data || !data.data.dl) {
      return reply("❌ *Failed to fetch the video. Please try again later.*");
    }

    let caption = `🎥 *CASEYRHODES-XMD VIDEO DOWNLOADER* 🎥\n\n📌 *Title:* ${data.data.title}\n🌐 *Source:* YouTube\n🔗 *Link:* ${video.url}\n\n💾 *Downloading your video... Please wait!*`;

    await client.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: caption
    }, { quoted: message });

    await client.sendMessage(from, {
      video: { url: data.data.dl },
      mimetype: "video/mp4"
    }, { quoted: message });

  } catch (error) {
    console.error(error);
    reply("⚠️ *An unexpected error occurred. Please try again later.*");
  }
});

// Audio Downloader
const audio = {
  pattern: "mp3",
  alias: ["play2", "play"],
  react: "🎶",
  desc: "Download YouTube song",
  category: "main",
  use: ".song <Yt url or Name>",
  filename: __filename
};

cmd(audio, async (client, message, args, { from, prefix, quoted, q, reply }) => {
  try {
    if (!q) {
      return await reply("❌ Please provide a YouTube URL or song name.");
    }

    await reply("🎶 Downloading Audio... Please wait for *cαѕєчrhσdєѕ хmd* user!");

    const searchResults = await ytsearch(q);
    if (searchResults.results.length < 1) {
      return reply("❌ No results found!");
    }

    let video = searchResults.results[0];
    let apiUrl = "https://ditzdevs-ytdl-api.hf.space/api/ytmp3?url=" + encodeURIComponent(video.url);
    console.log("🔗 API URL:", apiUrl);
    
    let response = await fetch(apiUrl);
    let data = await response.json();
    console.log("📥 API Response:", data);

    if (!data.status || !data.download || !data.download.downloadUrl) {
      return reply("❌ Failed to fetch the audio. Please try again later.");
    }

    let caption = `🎶 *CASEYRHODES-XMD MUSIC DOWNLOADER* 🎶\n\n📀 *Title:* ${data.download.title}\n⏳ *Duration:* ${data.result.duration} sec\n🔗 *YouTube Link:* ${video.url}\n🕒 *Expires In:* ${data.download.expiresIn}\n\n> *© pσwєrєd вч cαѕєчrhσdєѕ tєch ♡*`;

    await client.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: caption
    }, { quoted: message });

    console.log("🎼 Sending audio from URL:", data.download.downloadUrl);
    
    await client.sendMessage(from, {
      audio: { url: data.download.downloadUrl },
      mimetype: "audio/mpeg"
    }, { quoted: message });

    console.log("✅ Audio sent successfully!");

  } catch (error) {
    console.error("❌ Error:", error);
    reply("❌ An error occurred. Please try again later.");
  }
});
