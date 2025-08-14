// lib/callhandler.js
const settingsManager = require('./settingsmanager'); // Essential to get live settings

/**
 * Handles incoming WhatsApp calls, rejects them, and sends a warning message.
 * @param {import('@whiskeysockets/baileys').WASocket} conn Baileys WhatsApp connection object.
 */
module.exports = (conn) => {
    conn.ev.on('call', async (callData) => {
        try {
            // Check the live ANTICALL setting
            if (!settingsManager.getSetting('ANTICALL')) {
                console.log("[ANTICALL] Call received but feature is OFF. Ignoring.");
                return;
            }

            for (const call of callData) {
                try {
                    if (call.status === 'offer') {
                        const callerId = call.from;

                        // Reject the call
                        await conn.rejectCall(call.id, callerId);

                        // Send warning message to caller
                        await conn.sendMessage(callerId, {
                            text: `🚫 *Auto Call Rejection!*\n\nPlease do not call this bot. Future calls may result in you being blocked.`,
                        });

                        console.log(`[ANTICALL] Rejected call from: ${callerId}`);
                    }
                } catch (callError) {
                    console.error(`[ANTICALL] Error processing call from ${call.from}:`, callError);
                }
            }
        } catch (error) {
            console.error('[ANTICALL] General error in call handler:', error);
        }
    });

    console.log("[ANTICALL] Call handler loaded and active.");
};
