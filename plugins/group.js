const config = require('../config');
const { cmd } = require('../command');

const isGroupAdmin = async (conn, groupId, userId) => {
    try {
        const metadata = await conn.groupMetadata(groupId);
        const participant = metadata.participants.find(p => p.id === userId);
        return participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (error) {
        return false;
    }
};

cmd({
    pattern: "promote",
    desc: "Promote member to admin",
    category: "group",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, sender, quoted, args, isCreator }) => {
    if (!m.isGroup) return reply("❌ Group only command");
    
    const isAdmin = await isGroupAdmin(conn, from, sender);
    if (!isAdmin && !isCreator) return reply("❌ Admin only command");
    
    let target = quoted ? quoted.sender : args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!target) return reply("❌ Mention or reply to user");
    
    await conn.groupParticipantsUpdate(from, [target], 'promote');
    reply(`✅ Promoted ${target.split('@')[0]}`);
});

cmd({
    pattern: "demote",
    desc: "Demote admin to member",
    category: "group",
    react: "🙆‍♀️",
    filename: __filename
},
async (conn, mek, m, { from, sender, quoted, args, isCreator }) => {
    if (!m.isGroup) return reply("❌ Group only command");
    
    const isAdmin = await isGroupAdmin(conn, from, sender);
    if (!isAdmin && !isCreator) return reply("❌ Admin only command");
    
    let target = quoted ? quoted.sender : args[0]?.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!target) return reply("❌ Mention or reply to user");
    
    await conn.groupParticipantsUpdate(from, [target], 'demote');
    reply(`✅ Demoted ${target.split('@')[0]}`);
});

cmd({
    pattern: "open",
    desc: "Open group for all members",
    category: "group",
    react: "🔓",
    filename: __filename
},
async (conn, mek, m, { from, sender, isCreator }) => {
    if (!m.isGroup) return reply("❌ Group only command");
    
    const isAdmin = await isGroupAdmin(conn, from, sender);
    if (!isAdmin && !isCreator) return reply("❌ Admin only command");
    
    await conn.groupSettingUpdate(from, 'not_announcement');
    reply("✅ Group opened");
});

cmd({
    pattern: "close",
    desc: "Close group for admins only",
    category: "group",
    react: "🔒",
    filename: __filename
},
async (conn, mek, m, { from, sender, isCreator }) => {
    if (!m.isGroup) return reply("❌ Group only command");
    
    const isAdmin = await isGroupAdmin(conn, from, sender);
    if (!isAdmin && !isCreator) return reply("❌ Admin only command");
    
    await conn.groupSettingUpdate(from, 'announcement');
    reply("✅ Group closed");
});

cmd({
    pattern: "tagall",
    desc: "Tag all group members",
    category: "group",
    react: "🫂",
    filename: __filename
},
async (conn, mek, m, { from, sender, args, isCreator }) => {
    if (!m.isGroup) return reply("❌ Group only command");
    
    const isAdmin = await isGroupAdmin(conn, from, sender);
    if (!isAdmin && !isCreator) return reply("❌ Admin only command");
    
    const groupMetadata = await conn.groupMetadata(from);
    const participants = groupMetadata.participants.map(p => p.id);
    const message = args.join(' ') || '📢 Attention everyone!';
    
    await conn.sendMessage(from, {
        text: `${message}\n\nTagged ${participants.length} members!`,
        mentions: participants
    }, { quoted: mek });
});
