const fetch = require("node-fetch");
const { cmd } = require("../command");

cmd({
  pattern: "tiktok",
  alias: ["tiktoks", "tiks"],
  desc: "Search for TikTok videos using a query.",
  react: '✅',
  category: 'tools',
  filename: __filename
}, async (conn, m, store, {
  from,
  args,
  reply
}) => {
  if (!args[0]) {
    return reply("🌸 What do you want to search on TikTok?\n\n*Usage Example:*\n.tiktoksearch <query>");
  }

  const query = args.join(" ");
  await store.react('⌛');

  try {
    reply(`🔎 Searching TikTok for: *${query}*`);
    
    const response = await fetch(`https://api.diioffc.web.id/api/search/tiktok?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data || !data.status || !data.result || data.result.length === 0) {
      await store.react('❌');
      return reply("❌ No results found for your query. Please try with a different keyword.");
    }

    // Get up to 7 random results
    const results = data.result.slice(0, 7).sort(() => Math.random() - 0.5);
    
    // Prepare template message with carousel of results
    const sections = results.map((video, index) => {
      return {
        title: `Result ${index + 1}: ${video.title.substring(0, 20)}${video.title.length > 20 ? '...' : ''}`,
        rows: [{
          title: `🎬 ${video.title.substring(0, 50)}`,
          description: `👤 ${video.author.name || 'Unknown'}\n❤️ ${video.stats.like} likes\n⏱️ ${video.duration}s\n📥 Download link available`,
          rowId: `.tiktokdl https://www.tiktok.com/@${video.author.username}/video/${video.video_id}`
        }]
      };
    });

    await conn.sendMessage(from, {
      text: `🌸 *TikTok Search Results* for *"${query}"*\n\nSelect a video to download:`,
      footer: "Powered by TikTok API",
      title: "TikTok Search Results",
      buttonText: "View Videos",
      sections
    }, { quoted: m });

    await store.react('✅');
  } catch (error) {
    console.error("Error in TikTokSearch command:", error);
    await store.react('❌');
    reply("❌ An error occurred while searching TikTok. Please try again later.");
  }
});
