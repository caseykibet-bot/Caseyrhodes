const axios = require("axios");
const { cmd } = require("../command");

// Command: bible
cmd({
    pattern: "bible",
    desc: "Fetch Bible verses by reference.",
    category: "fun",
    react: "📖",
    filename: __filename
}, async (conn, mek, m, { args, reply, from }) => {
    try {
        if (args.length === 0) {
            return reply(`⚠️ *Please provide a Bible reference.*\n\n📝 *Example:*\n.bible John 1:1`);
        }

        const reference = args.join(" ");
        const apiUrl = `https://bible-api.com/${encodeURIComponent(reference)}`;
        const response = await axios.get(apiUrl);

        if (response.status === 200 && response.data.text) {
            const { reference: ref, text, translation_name } = response.data;
            const status = `📜 *Bible Verse Found!*\n\n` +
                         `📖 *Reference:* ${ref}\n` +
                         `📚 *Text:* ${text}\n\n` +
                         `🗂️ *Translation:* ${translation_name}\n\n` +
                         `© CASEYRHODES XMD BIBLE`;

            await conn.sendMessage(m.chat, { 
                image: { url: `https://files.catbox.moe/y3j3kl.jpg` },
                caption: status,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363302677217436@newsletter',
                        newsletterName: 'CASEYRHODES BIBLE 🎉🙏',
                        serverMessageId: 143
                    },
                    externalAdReply: {
                        showAdAttribution: true,
                        title: "CASEYRHODES BIBLE 🎉🙏",
                        body: "Daily Bible Verses & Inspiration",
                        mediaType: 1,
                        thumbnailUrl: "https://files.catbox.moe/y3j3kl.jpg",
                        sourceUrl: ""
                    }
                }
            }, { quoted: mek });
        } else {
            reply("❌ *Verse not found.* Please check the reference and try again.");
        }
    } catch (error) {
        console.error(error);
        reply("⚠️ *An error occurred while fetching the Bible verse.* Please try again.");
    }
});
