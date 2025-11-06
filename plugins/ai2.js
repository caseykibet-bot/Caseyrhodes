const { cmd } = require('../command');
const axios = require("axios");

// Newsletter configuration
const NEWSLETTER_CONFIG = {
    newsletterJid: '120363420261263259@newsletter',
    newsletterName: 'ꜰʀᴏꜱᴛ-xᴍᴅ ᴘʀᴇᴍɪᴜᴍ 🌟',
    serverMessageId: -1
};

// External Ad configuration
const AD_CONFIG = {
    title: "𝐅𝐑𝐎𝐒𝐓-𝐗𝐌𝐃 𝐀𝐈 𝐒𝐄𝐑𝐕𝐈𝐂𝐄 ❄️",
    body: "ᴘʀᴇᴍɪᴜᴍ ᴀɪ ᴀꜱꜱɪꜱᴛᴀɴᴛ",
    thumbnailUrl: "https://files.catbox.moe/dg3jwo.jpg",
    sourceUrl: "https://wa.me/254112192119"
};

// API endpoints for faster response
const API_ENDPOINTS = [
    `https://api.giftedtech.co.ke/api/ai/geminiaipro?apikey=gifted&q=`,
    `https://lance-frank-asta.onrender.com/api/gpt?q=`
];

// Custom responses cache
const CUSTOM_RESPONSES = {
    owner: `*👨‍💻 MEET THE DEVELOPER*\n\n🇰🇪 *Primary Developer:* CaseyRhodes Tech\n• Location: Kenya\n• Specialization: AI Integration & Bot Development\n• Role: Lead Developer & Project Owner\n\n🤖 *Technical Partner:* Caseyrhodes\n• Specialization: Backend Systems & API Management\n• Role: Technical Support & Infrastructure\n\n*About Our Team:*\nCasey AI is the result of CaseyRhodes Tech collaboration. Together, we bring you cutting-edge AI technology with reliable bot functionality, ensuring you get the best AI experience possible.\n\n*Proudly Made in Kenya* 🇰🇪`,
    
    creation: `*📅 CASEY AI TIMELINE*\n\n🚀 *Development Started:* December 2024\n🎯 *First Release:* January 2025\n🔄 *Current Version:* 2.0 (February 2025)\n\n*Development Journey:*\n• *Phase 1:* Core AI integration and basic functionality\n• *Phase 2:* Enhanced response system and multi-API support\n• *Phase 3:* Advanced customization and user experience improvements\n\n*What's Next:*\nWe're constantly working on updates to make Casey AI smarter, faster, and more helpful. Stay tuned for exciting new features!\n\n*Age:* Just a few months old, but getting smarter every day! 🧠✨`,
    
    name: `*🏷️ MY NAME*\n\n👋 Hello! My name is *CASEY AI*\n\n*About My Name:*\n• Full Name: Casey AI\n• Short Name: Casey\n• You can call me: Casey, Casey AI, or just AI\n\n*Name Origin:*\nI'm named after my primary developer *CaseyRhodes Tech*, combining the personal touch of my creator with the intelligence of artificial intelligence technology.\n\n*What Casey Stands For:*\n🔹 *C* - Creative Problem Solving\n🔹 *A* - Advanced AI Technology\n🔹 *S* - Smart Assistance\n🔹 *E* - Efficient Responses\n🔹 *Y* - Your Reliable Companion\n\n*Made in Kenya* 🇰🇪 *by CaseyRhodes Tech*`,
    
    about: `👋 Hi! I'm *Casey AI*, your intelligent WhatsApp assistant developed by CaseyRhodes Tech.\n\n*What I Can Do:*\n• Answer questions on any topic\n• Help with problem-solving\n• Provide information and explanations\n• Assist with creative tasks\n• Engage in meaningful conversations\n\n*My Features:*\n✅ Advanced AI technology\n✅ Multi-language support\n✅ Fast response times\n✅ Reliable dual-API system\n✅ User-friendly interface\n\n*My Identity:*\n• Name: Casey AI\n• Origin: Kenya 🇰🇪\n• Purpose: Making AI accessible and helpful\n\n*Proudly Kenyan:* 🇰🇪\nBuilt with passion in Kenya, serving users worldwide with cutting-edge AI technology.\n\nHow can I assist you today?`
};

// Function to send message with newsletter context
const sendWithContext = async (conn, from, content, quoted = null) => {
    const messageOptions = {
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: NEWSLETTER_CONFIG,
            externalAdReply: {
                title: AD_CONFIG.title,
                body: AD_CONFIG.body,
                mediaType: 1,
                thumbnailUrl: AD_CONFIG.thumbnailUrl,
                sourceUrl: AD_CONFIG.sourceUrl,
                renderLargerThumbnail: false
            }
        }
    };

    if (content.image && content.caption) {
        messageOptions.image = content.image;
        messageOptions.caption = content.caption;
    } else if (content.text) {
        messageOptions.text = content.text;
    }

    return await conn.sendMessage(from, messageOptions, { quoted });
};

// Function to get custom response quickly
const getCustomResponse = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('owner') || lowerText.includes('developer') || lowerText.includes('creator') || 
        lowerText.includes('who owns you') || lowerText.includes('who created you') || 
        lowerText.includes('who developed you') || lowerText.includes('who built you')) {
        return CUSTOM_RESPONSES.owner;
    }
    
    if (lowerText.includes('when were you made') || lowerText.includes('when were you created') || 
        lowerText.includes('when were you developed') || lowerText.includes('creation date') || 
        lowerText.includes('when did you start') || lowerText.includes('how old are you') ||
        lowerText.includes('when were you built') || lowerText.includes('release date')) {
        return CUSTOM_RESPONSES.creation;
    }

    if (lowerText.includes('what is your name') || lowerText.includes('what\'s your name') || 
        lowerText.includes('tell me your name') || lowerText.includes('your name') || 
        lowerText.includes('name?') || lowerText.includes('called?')) {
        return CUSTOM_RESPONSES.name;
    }

    if (lowerText.includes('what are you') || lowerText.includes('tell me about yourself') || 
        lowerText.includes('who are you') || lowerText.includes('about casey')) {
        return CUSTOM_RESPONSES.about;
    }

    return null;
};

// Fast API call function
const fetchAIResponse = async (query) => {
    const encodedQuery = encodeURIComponent(query);
    
    // Use Promise.race for faster response from the first API that responds
    const promises = API_ENDPOINTS.map(api => 
        axios.get(api + encodedQuery, { timeout: 8000 }).catch(() => null)
    );

    try {
        const result = await Promise.race(promises);
        if (result?.data) {
            return result.data?.result || result.data?.response || result.data?.answer || result.data;
        }
    } catch (error) {
        console.error('Primary API failed:', error.message);
    }

    // If first race fails, try all APIs
    for (const api of API_ENDPOINTS) {
        try {
            const res = await axios.get(api + encodedQuery, { timeout: 8000 });
            const response = res.data?.result || res.data?.response || res.data?.answer || res.data;
            if (response && typeof response === 'string' && response.trim() !== '') {
                return response;
            }
        } catch (err) {
            console.error(`API Error:`, err.message);
            continue;
        }
    }
    return null;
};

cmd({
    pattern: "ai",
    alias: ["ask", "gpt", "casey"],
    desc: "AI chatbot powered by Casey AI",
    category: "ai",
    filename: __filename
}, async (conn, mek, m, { from, sender, text, prefix }) => {
    try {
        // Send reaction immediately
        await conn.sendMessage(sender, { 
            react: { text: '🤖', key: mek.key } 
        });

        const q = text || mek.message?.imageMessage?.caption || mek.message?.videoMessage?.caption || '';

        if (!q || q.trim() === '') {
            return await sendWithContext(conn, from, {
                text: `❓ *Please ask me something*\n\n*Example:* ${prefix}ai Who are you?`
            }, mek);
        }

        // Check for custom responses first (fast path)
        const customResponse = getCustomResponse(q);
        if (customResponse) {
            return await sendWithContext(conn, from, {
                image: { url: 'https://i.ibb.co/fGSVG8vJ/caseyweb.jpg' },
                caption: customResponse
            }, mek);
        }

        // Fetch AI response
        const response = await fetchAIResponse(q);

        if (!response) {
            return await sendWithContext(conn, from, {
                text: `❌ *I'm experiencing technical difficulties*\nAll AI APIs are currently unavailable. Please try again later.`
            }, mek);
        }

        // Send AI response
        await sendWithContext(conn, from, {
            image: { url: 'https://i.ibb.co/fGSVG8vJ/caseyweb.jpg' },
            caption: `🤖 *Caseyrhodes AI:*\n\n${response}\n\n👨‍💻 *Developer:* CaseyRhodes Tech`
        }, mek);

    } catch (e) {
        console.error('AI Command Error:', e);
        // Send error with newsletter context too
        await sendWithContext(conn, from, {
            text: `❌ *AI Error:* ${e.message}\nPlease try again later.`
        }, mek);
    }
});
