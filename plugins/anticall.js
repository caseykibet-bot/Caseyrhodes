const { cmd } = require("../command");
const config = require("../config");
const fs = require('fs');
const path = require('path');

const recentCallers = new Set();

// Anti-call handler
cmd({ on: "body" }, async (client, message, chat, { from: sender }) => {
  try {
    client.ev.on("call", async (callData) => {
      if (config.ANTI_CALL !== true) return; // Changed to boolean check

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

// Improved toggle command with better config handling
cmd(
  {
    pattern: "anticall",
    desc: "Toggle call rejection feature",
    category: "config",
    fromMe: true
  },
  async (client, message) => {
    try {
      // Toggle the value
      const newValue = !config.ANTI_CALL;
      config.ANTI_CALL = newValue;

      // Update config file
      const configPath = path.join(__dirname, '../config.json'); // Changed to .json
      let configFile = require(configPath);
      configFile.ANTI_CALL = newValue;
      
      fs.writeFileSync(
        configPath,
        JSON.stringify(configFile, null, 2) // Proper formatting
      );

      await client.sendMessage(
        message.chat,
        {
          text: `📞 Call rejection is now *${newValue ? "ENABLED" : "DISABLED"}*`
        },
        { quoted: message }
      );

    } catch (error) {
      console.error("Config update error:", error);
      await client.sendMessage(
        message.chat,
        {
          text: `⚠️ Failed to update settings: ${error.message}\n\nCurrent status: ${config.ANTI_CALL ? "ENABLED" : "DISABLED"}`
        },
        { quoted: message }
      );
    }
  }
);
