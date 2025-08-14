const { cmd } = require("../command");
const config = require("../config");
const fs = require('fs');
const path = require('path');

const recentCallers = new Set();

// Anti-call handler (unchanged)
cmd({ on: "body" }, async (client, message, chat, { from: sender }) => {
  try {
    client.ev.on("call", async (callData) => {
      if (!config.ANTI_CALL) return;

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

// FINAL FIXED TOGGLE COMMAND
cmd(
  {
    pattern: "anticall",
    desc: "Toggle call rejection feature",
    category: "config",
    fromMe: true
  },
  async (client, message) => {
    try {
      // Clear cache and reload config
      delete require.cache[require.resolve('../config')];
      const freshConfig = require("../config");
      
      // Toggle the value
      const newValue = !freshConfig.ANTI_CALL;
      
      // Update config file
      const configPath = path.join(__dirname, '../config.js');
      let configContent = fs.readFileSync(configPath, 'utf-8');
      
      // Handle all possible config formats
      const updatedContent = configContent
        .replace(
          /ANTI_CALL: (true|false)/,
          `ANTI_CALL: ${newValue}`
        )
        .replace(
          /ANTI_CALL = (true|false)/,
          `ANTI_CALL = ${newValue}`
        )
        .replace(
          /ANTI_CALL: ["'](true|false)["']/,
          `ANTI_CALL: ${newValue}`
        );

      fs.writeFileSync(configPath, updatedContent);
      
      // Update in-memory config
      config.ANTI_CALL = newValue;

      // Send CORRECT status message
      await client.sendMessage(
        message.chat,
        {
          text: `📞 Call rejection is now *${newValue ? "ENABLED ✅" : "DISABLED ❌"}*\n\n` +
                `Actual status: ${newValue}\n` +
                `Previous status: ${!newValue}`
        },
        { quoted: message }
      );

    } catch (error) {
      console.error("Config update error:", error);
      await client.sendMessage(
        message.chat,
        {
          text: `⚠️ Error updating settings: ${error.message}\n\n` +
                `Current status: ${config.ANTI_CALL ? "ENABLED" : "DISABLED"}\n` +
                `Config path: ${path.join(__dirname, '../config.js')}`
        },
        { quoted: message }
      );
    }
  }
);
