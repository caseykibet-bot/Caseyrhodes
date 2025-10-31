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
        
        // Check if user mentioned someone
        if (mentionedJid && mentionedJid.length > 0) {
            targetUser = mentionedJid[0];
        } 
        // Check if replied to a message
        else if (quoted && quoted.sender) {
            targetUser = quoted.sender;
        }
        
        try {
            const ppUrl = await conn.profilePictureUrl(targetUser, 'image');
            
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
        } catch (profileError) {
            await reply(`❌ @${targetUser.split('@')[0]} doesn't have a profile picture or it's private.`, {
                mentions: [targetUser]
            });
        }
        
    } catch (error) {
        console.error('Profile Picture Error:', error);
        await reply("❌ Error fetching profile picture. Please try again.");
    }
});
