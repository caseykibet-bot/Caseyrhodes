const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "openai",
    alias: ["chatgpt", "gpt3", "open-gpt","gpt5"],
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for OpenAI.\nExample: `.openai Hello`");

        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            await react("❌");
            return reply("OpenAI failed to respond. Please try again later.");
        }

        await reply(`🧠 *OpenAI Response:*\n\n${data.result}`);
        await react("✅");
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        await react("❌");
        reply("An error occurred while communicating with OpenAI.");
    }
});

cmd({
    pattern: "ai",
    alias: ["bot", "xd", "gpt", "gpt4", "bing"],
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for the AI.\nExample: `.ai Hello`");

        // Try multiple API endpoints
        const apiEndpoints = [
            `https://api.dreaded.site/api/gemini2?text=${encodeURIComponent(q)}`,
            `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`
        ];

        let response;
        for (const endpoint of apiEndpoints) {
            try {
                const { data } = await axios.get(endpoint);
                if (data && (data.message || data.result)) {
                    response = data.message || data.result;
                    break;
                }
            } catch (e) {
                console.log(`Error with API endpoint ${endpoint}:`, e.message);
                continue;
            }
        }

        if (!response) {
            await react("❌");
            return reply("All AI APIs failed to respond. Please try again later.");
        }
        
        const status = `🤖 *CASEYRHODES-XMD AI Response:*\n\n${response}`;
        
        // Send image + caption + audio combined with newsletter info
        await conn.sendMessage(from, { 
            image: { url: `https://files.catbox.moe/y3j3kl.jpg` },  
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363302677217436@newsletter',
                    newsletterName: '𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐀𝐈 🤖',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
});
         
cmd({
    pattern: "deepseek",
    alias: ["deep", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    react: "👾",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for DeepSeek AI.\nExample: `.deepseek Hello`");

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await react("❌");
            return reply("DeepSeek AI failed to respond. Please try again later.");
        }

        await reply(`👾 *DeepSeek AI Response:*\n\n${data.answer}`);
        await react("✅");
    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with DeepSeek AI.");
    }
});
