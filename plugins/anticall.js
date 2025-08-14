const { cmd } = require("../command");
const config = require("../config");
const fs = require('fs');
const path = require('path');

const recentCallers = new Set();

// Anti-call handler (same as before but with better variable names)
cmd({ on: "body" }, async (client, message, chat, { from: sender }) => {
  try {
    client.ev.on("call", async (callData) => {
      if (config.ANTI_CALL !== "true") return;

      for (const call of callData) {
        if (call.status === 'offer' && !call.isGroup) {
          await client.rejectCall(call.id, call.from);
          
          if (!recentCallers.has(call.from)) {
            recentCallers.add(call.from);
            
            await client.sendMessage(call.from, {
              text: "```Hii this is CASEYRHODES-XMD a Personal Assistant!! Sorry for now, we cannot receive calls, whether in a group or personal if you need help or request features please chat owner``` ⚠️",
              mentions: [call.from]
            });
            
            setTimeout(() => recentCallers.delete(call.from), 600000);
          }
        }
      }
    });
  } catch (error) {
    console.error("Call rejection error:", error);
    await client.sendMessage(sender, { text: "⚠️ Error: " + error.message }, { quoted: chat });
  }
});

// New command to toggle anti-call
cmd(
  {
    pattern: "anticall",
    desc: "Toggle anti-call feature",
    category: "config",
    fromMe: true // Only bot owner can use this
  },
  async (client, message, match) => {
    try {
      // Toggle the value
      config.ANTI_CALL = config.ANTI_CALL === "true" ? "false" : "true";
      
      // Save to config file
      const configPath = path.join(__dirname, '../config.js');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      const updatedContent = configContent.replace(
        /ANTI_CALL: ".*"/,
        `ANTI_CALL: "${config.ANTI_CALL}"`
      );
      fs.writeFileSync(configPath, updatedContent);
      
      await client.sendMessage(message.chat, {
        text: `Anti-call feature is now *${config.ANTI_CALL === "true" ? "ENABLED" : "DISABLED"}*`
      }, { quoted: message });
      
    } catch (error) {
      console.error("Error toggling anti-call:", error);
      await client.sendMessage(message.chat, {
        text: "⚠️ Error toggling anti-call: " + error.message
      }, { quoted: message });
    }
  }
);
