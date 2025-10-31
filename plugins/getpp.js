const { cmd } = require('../command');

cmd({
    pattern: "getpp",
    alias: ["pp", "profilepic", "dp"],
    desc: "Get user's profile picture",
    category: "utility",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, text, mentionedJid, quoted }) => {
    try {
        await conn.sendMessage(sender, { react: { text: '👤', key: mek.key } });
        
        let targetUser = sender;
        
        // Check if user mentioned someone or replied to a message
        if (mentionedJid && mentionedJid.length > 0) {
            targetUser = mentionedJid[0];
        } else if (quoted) {
            targetUser = quoted.sender;
        }
        
        const ppUrl = await conn.profilePictureUrl(targetUser, 'image').catch(() => null);
        
        if (ppUrl) {
            await conn.sendMessage(from, {
                image: { url: ppUrl },
                caption: `📸 Profile picture of @${targetUser.split('@')[0]}`,
                mentions: [targetUser]
            }, { quoted: mek });
        } else {
            await reply(`❌ @${targetUser.split('@')[0]} doesn't have a profile picture.`, {
                mentions: [targetUser]
            });
        }
    } catch (error) {
        console.error(error);
        await reply("❌ Error fetching profile picture.");
    }
});
