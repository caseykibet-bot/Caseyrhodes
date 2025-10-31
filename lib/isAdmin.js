async function isAdmin(conn, chatId, userId) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return { isSenderAdmin: false, isBotAdmin: false };
        }
        
        const groupMetadata = await conn.groupMetadata(chatId);
        
        // Get bot ID in correct format
        const botId = conn.user.id;
        
        // Find participant for user
        const participant = groupMetadata.participants.find(p => 
            p.id === userId || 
            p.id === userId.replace('@s.whatsapp.net', '') ||
            p.id === (userId.includes('@') ? userId : userId + '@s.whatsapp.net')
        );
        
        // Find bot participant
        const bot = groupMetadata.participants.find(p => 
            p.id === botId || 
            p.id === botId.replace('@s.whatsapp.net', '') ||
            p.id.includes(botId.split('@')[0])
        );
        
        const isBotAdmin = bot ? ['admin', 'superadmin'].includes(bot.admin) : false;
        const isSenderAdmin = participant ? ['admin', 'superadmin'].includes(participant.admin) : false;

        return { isSenderAdmin, isBotAdmin };
    } catch (error) {
        console.error('Error in isAdmin:', error);
        return { isSenderAdmin: false, isBotAdmin: false };
    }
}

module.exports = isAdmin;
