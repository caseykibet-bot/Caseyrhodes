const { cmd } = require('../command');

// Cat command
cmd({
    pattern: "cat",
    alias: ["kitty", "meow"],
    desc: "Get random cat images",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        await conn.sendMessage(sender, { react: { text: '🐱', key: mek.key } });
        
        const res = await fetch('https://api.thecatapi.com/v1/images/search');
        const data = await res.json();
        
        if (!data || !data[0]?.url) {
            return await reply('❌ Couldn\'t fetch cat image.');
        }
        
        const catImageUrl = data[0].url;
        const stylishText = `🐱 *Meow! Here's your cute cat!* 🐱`;
        
        await conn.sendMessage(from, {
            image: { url: catImageUrl },
            caption: stylishText,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420261263259@newsletter',
                    newsletterName: "𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐓𝐄𝐂𝐇",
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: "𝐂𝐚𝐬𝐞𝐲𝐫𝐡𝐨𝐝𝐞𝐬 | 𝐂𝐚𝐭 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 🐱",
                    body: "Speed • Stability • Sync",
                    thumbnailUrl: catImageUrl, // Uses the actual cat image
                    sourceUrl: 'https://whatsapp.com/channel/0029Va9m8FHDI1lQUL2+3p3L',
                    mediaType: 1,
                    renderLargerThumbnail: false,
                }
            }
        }, { quoted: mek });
        
    } catch (err) {
        console.error('Cat command error:', err);
        await reply('❌ Failed to fetch cat image. Please try again later.');
    }
});

// Dog command
cmd({
    pattern: "dog",
    alias: ["puppy", "woof", "doggy"],
    desc: "Get random dog images",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        await conn.sendMessage(sender, { react: { text: '🐶', key: mek.key } });
        
        const res = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await res.json();
        
        if (!data || !data.message) {
            return await reply('❌ Couldn\'t fetch dog image.');
        }
        
        const dogImageUrl = data.message;
        const stylishText = `🐶 *Woof! Here's your cute dog!* 🐶`;
        
        await conn.sendMessage(from, {
            image: { url: dogImageUrl },
            caption: stylishText,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363420261263259@newsletter',
                    newsletterName: "𝐂𝐀𝐒𝐄𝐘𝐑𝐇𝐎𝐃𝐄𝐒 𝐓𝐄𝐂𝐇",
                    serverMessageId: 143
                },
                externalAdReply: {
                    title: "𝐂𝐚𝐬𝐞𝐲𝐫𝐡𝐨𝐝𝐞𝐬 | 𝐃𝐨𝐠 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 🐶",
                    body: "Speed • Stability • Sync",
                    thumbnailUrl: dogImageUrl, // Uses the actual dog image
                    sourceUrl: 'https://whatsapp.com/channel/0029Va9m8FHDI1lQUL2+3p3L',
                    mediaType: 1,
                    renderLargerThumbnail: false,
                }
            }
        }, { quoted: mek });
        
    } catch (err) {
        console.error('Dog command error:', err);
        await reply('❌ Failed to fetch dog image. Please try again later.');
    }
});
