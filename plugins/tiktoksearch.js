const fetch = require("node-fetch");
const { cmd } = require("../command");

cmd({
  pattern: "tiktok",
  alias: ["tiktoks", "tiks"],
  desc: "Search for high quality TikTok videos",
  react: '✅',
  category: 'tools',
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  if (!args[0]) {
    return reply("🌸 Please provide a search query\nExample: .tiktok trending dance");
  }

  const query = args.join(" ");
  await store.react('⌛');
  
  try {
    const searchMsg = await reply(`🔍 Searching TikTok for: *${query}*...`);
    
    const apiUrl = `https://api.diioffc.web.id/api/search/tiktok?query=${encodeURIComponent(query)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data?.status || !data.result?.length) {
      await store.react('❌');
      return reply("❌ No high-quality results found. Try different keywords.");
    }

    // Filter and sort by quality (no_watermark first, then HD)
    const sortedVideos = data.result
      .filter(v => v.media?.no_watermark || v.media?.play)
      .sort((a, b) => {
        if (a.media.no_watermark && !b.media.no_watermark) return -1;
        if (!a.media.no_watermark && b.media.no_watermark) return 1;
        return (b.stats.play || 0) - (a.stats.play || 0); // Sort by popularity
      });

    if (!sortedVideos.length) {
      await store.react('❌');
      return reply("⚠️ Found videos but couldn't get high quality versions.");
    }

    // Pick the best available video
    const bestVideo = sortedVideos[0];
    const videoUrl = bestVideo.media.no_watermark || bestVideo.media.play;

    // Build quality info message
    const qualityInfo = bestVideo.media.no_watermark 
      ? "HD (No Watermark)" 
      : bestVideo.media.play 
        ? "HD (With Watermark)" 
        : "Standard Quality";

    const caption = `🎬 *${bestVideo.title || "TikTok Video"}*\n\n` +
      `👤 *Creator*: ${bestVideo.author?.name || 'Unknown'} (@${bestVideo.author?.username})\n` +
      `⏱️ *Duration*: ${bestVideo.duration}s\n` +
      `📊 *Stats*: ${bestVideo.stats?.play || 0} views | ${bestVideo.stats?.like || 0} likes\n` +
      `🛡️ *Quality*: ${qualityInfo}\n` +
      `🔗 *URL*: https://tiktok.com/@${bestVideo.author?.username}/video/${bestVideo.video_id}`;

    // Send as reply to original message
    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: caption,
      mentions: [m.sender]
    }, { quoted: m });

    // Delete the searching message if possible
    try {
      if (searchMsg?.key) await conn.sendMessage(from, {
        delete: searchMsg.key
      });
    } catch (e) {
      console.log("Couldn't delete search message");
    }

    await store.react('✅');
  } catch (error) {
    console.error("TikTok Error:", error);
    await store.react('❌');
    reply("🚨 Error fetching TikTok content. Please try again later.");
  }
});
