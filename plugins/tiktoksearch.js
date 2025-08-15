const fetch = require("node-fetch");
const { cmd } = require("../command");

cmd({
  pattern: "tiktok",
  alias: ["tiktoks", "tiks"],
  desc: "Search for TikTok videos using a query.",
  react: '✅',
  category: 'tools',
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  if (!args[0]) {
    return reply("🌸 What do you want to search on TikTok?\n\n*Usage Example:*\n.tiktok <query>");
  }

  const query = args.join(" ");
  await store.react('⌛');

  try {
    await reply(`🔎 Searching TikTok for: *${query}*`);
    
    const response = await fetch(`https://api.diioffc.web.id/api/search/tiktok?query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data?.status || !data?.result?.length) {
      await store.react('❌');
      return reply("❌ No results found for your query. Please try with a different keyword.");
    }

    // Get up to 5 results for cleaner display
    const results = data.result.slice(0, 5);
    
    // Format results horizontally
    let resultText = `🌸 *TikTok Results for "${query}"*\n\n`;
    
    results.forEach((video, index) => {
      resultText += 
        `*${index + 1}.* ${video.title.substring(0, 40)}${video.title.length > 40 ? '...' : ''}\n` +
        `👤 @${video.author?.username || 'unknown'}` +
        ` | ❤️ ${video.stats?.like || 0}` +
        ` | ⏱️ ${video.duration || 0}s\n` +
        `🔗 https://www.tiktok.com/@${video.author?.username}/video/${video.video_id}\n\n`;
    });

    resultText += `\n*Total Results:* ${results.length}`;

    await conn.sendMessage(from, { 
      text: resultText 
    }, { quoted: m });

    await store.react('✅');
  } catch (error) {
    console.error("Error in TikTok command:", error);
    await store.react('❌');
    reply("❌ An error occurred while searching TikTok. Please try again later.");
  }
});
