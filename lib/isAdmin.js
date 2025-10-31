async function isAdmin(conn, chatId, userId) {
    try {
        if (!chatId.endsWith('@g.us')) return false;
        
        const metadata = await conn.groupMetadata(chatId);
        const participants = metadata.participants;
        const user = participants.find(participant => participant.id === userId);
        
        return user ? ['admin', 'superadmin'].includes(user.admin) : false;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

module.exports = isAdmin;
