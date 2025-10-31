const { cmd } = require('../command');
const axios = require("axios");

cmd({
    pattern: "ai",
    alias: ["ask", "gpt", "casey"],
    desc: "AI chatbot powered by Casey AI",
    category: "ai",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, text, prefix }) => {
    try {
        await conn.sendMessage(sender, { react: { text: '🤖', key: mek.key } });

        const q = text || mek.message?.imageMessage?.caption || mek.message?.videoMessage?.caption || '';

        if (!q || q.trim() === '') {
            return await reply(`❓ *Please ask me something*\n\n*Example:* ${prefix}ai Who are you?`);
        }

        // Function to handle custom responses
        const getCustomResponse = (text) => {
            const lowerText = text.toLowerCase();
            
            // Check for owner/developer related queries
            if (lowerText.includes('owner') || lowerText.includes('developer') || lowerText.includes('creator') || 
                lowerText.includes('who owns you') || lowerText.includes('who created you') || 
                lowerText.includes('who developed you') || lowerText.includes('who built you')) {
                
                return `*👨‍💻 MEET THE DEVELOPER*\n\n🇰🇪 *Primary Developer:* CaseyRhodes Tech\n• Location: Kenya\n• Specialization: AI Integration & Bot Development\n• Role: Lead Developer & Project Owner\n\n🤖 *Technical Partner:* Caseyrhodes\n• Specialization: Backend Systems & API Management\n• Role: Technical Support & Infrastructure\n\n*About Our Team:*\nCasey AI is the result of a CaseyRhodes Tech  Together, we bring you cutting-edge AI technology with reliable bot functionality, ensuring you get the best AI experience possible.\n\n*Proudly Made in Kenya* 🇰🇪`;
            }
            
            // Check for creation date/when made queries
            if (lowerText.includes('when were you made') || lowerText.includes('when were you created') || 
                lowerText.includes('when were you developed') || lowerText.includes('creation date') || 
                lowerText.includes('when did you start') || lowerText.includes('how old are you') ||
                lowerText.includes('when were you built') || lowerText.includes('release date')) {
                
                return `*📅 CASEY AI TIMELINE*\n\n🚀 *Development Started:* December 2025\n🎯 *First Release:* January 2025\n🔄 *Current Version:* 2.0 (February 2025)\n\n*Development Journey:*\n• *Phase 1:* Core AI integration and basic functionality\n• *Phase 2:* Enhanced response system and multi-API support\n• *Phase 3:* Advanced customization and user experience improvements\n\n*What's Next:*\nWe're constantly working on updates to make Casey AI smarter, faster, and more helpful. Stay tuned for exciting new features!\n\n*Age:* Just a few months old, but getting smarter every day! 🧠✨`;
            }

            // Check for AI name queries
            if (lowerText.includes('what is your name') || lowerText.includes('what\'s your name') || 
                lowerText.includes('tell me your name') || lowerText.includes('your name') || 
                lowerText.includes('name?') || lowerText.includes('called?')) {
                
                return `*🏷️ MY NAME*\n\n👋 Hello! My name is *CASEY AI*\n\n*About My Name:*\n• Full Name: Casey AI\n• Short Name: Casey\n• You can call me: Casey, Casey AI, or just AI\n\n*Name Origin:*\nI'm named after my primary developer *CaseyRhodes Tech*, combining the personal touch of my creator with the intelligence of artificial intelligence technology.\n\n*What Casey Stands For:*\n🔹 *C* - Creative Problem Solving\n🔹 *A* - Advanced AI Technology\n🔹 *S* - Smart Assistance\n🔹 *E* - Efficient Responses\n🔹 *Y* - Your Reliable Companion\n\n*Made in Kenya* 🇰🇪 *by CaseyRhodes Tech*`;
            }

            // Check for general info about Casey AI
            if (lowerText.includes('what are you') || lowerText.includes('tell me about yourself') || 
                lowerText.includes('who are you') || lowerText.includes('about casey')) {
                
                return `👋 Hi! I'm *Casey AI*, your intelligent WhatsApp assistant developed by CaseyRhodes Tech.\n\n*What I Can Do:*\n• Answer questions on any topic\n• Help with problem-solving\n• Provide information and explanations\n• Assist with creative tasks\n• Engage in meaningful conversations\n\n*My Features:*\n✅ Advanced AI technology\n✅ Multi-language support\n✅ Fast response times\n✅ Reliable dual-API system\n✅ User-friendly interface\n\n*My Identity:*\n• Name: Casey AI\n• Origin: Kenya 🇰🇪\n• Purpose: Making AI accessible and helpful\n\n*Proudly Kenyan:* 🇰🇪\nBuilt with passion in Kenya, serving users worldwide with cutting-edge AI technology.\n\nHow can I assist you today?`;
            }

            // Return null if no custom response matches
            return null;
        };

        // Check for custom responses first
        const customResponse = getCustomResponse(q);
        if (customResponse) {
            return await conn.sendMessage(from, {
                image: { url: 'https://i.ibb.co/fGSVG8vJ/caseyweb.jpg' },
                caption: customResponse
            }, { quoted: mek });
        }

        const apis = [
            `https://api.giftedtech.co.ke/api/ai/geminiaipro?apikey=gifted&q=${encodeURIComponent(q)}`,
            `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`
        ];

        let response = null;
        for (const apiUrl of apis) {
            try {
                const res = await axios.get(apiUrl, { timeout: 10000 });
                response = res.data?.result || res.data?.response || res.data?.answer || res.data;
                if (response && typeof response === 'string' && response.trim() !== '') {
                    break;
                }
            } catch (err) {
                console.error(`AI Error (${apiUrl}):`, err.message);
                continue;
            }
        }

        if (!response) {
            return await reply(`❌ *I'm experiencing technical difficulties*\nAll AI APIs are currently unavailable. Please try again later.`);
        }

        // Send AI response with image
        await conn.sendMessage(from, {
            image: { url: 'https://i.ibb.co/fGSVG8vJ/caseyweb.jpg' },
            caption: `🤖 *Caseyrhodes AI:*\n\n${response}\n\n👨‍💻 *Developer:* CaseyRhodes Tech`
        }, { quoted: mek });

    } catch (e) {
        console.error('AI Command Error:', e);
        await reply(`❌ *AI Error:* ${e.message}\nPlease try again later.`);
    }
});
