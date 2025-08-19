const { cmd } = require('../command');
const axios = require('axios');

// TA CLÉ API GOOGLE
const GOOGLE_API_KEY = 'AIzaSyDTTZLjwsvHXnETvqK6VF9iEENgaPM18SU';

global.darkAiEnabled = true;
global.darkAiRPmode = false;
global.userChats = {};

const identityTriggers = [
  "t'es qui", "tes qui", "tu es qui", "c'est qui", "c ki", "ki es tu", "qui es-tu", "qui es tu",
  "who are you", "who r u"
];

const identityResponseFR = "👁️‍🗨️ *Je suis Dark-AI, développé dans l’ombre par l’exorciste de l’ombre : Dark-DEv...* 🌑";
const identityResponseEN = "👁️‍🗨️ *I am Dark-AI, forged in the shadows by the shadow exorcist: Dark-DEv...* 🌑";

function detectLanguage(text) {
  const lower = text.toLowerCase();
  const fr = ["qui", "c'est", "tu es", "tes"];
  const en = ["who", "are", "you", "what"];
  if (fr.some(k => lower.includes(k))) return 'fr';
  if (en.some(k => lower.includes(k))) return 'en';
  return 'fr';
}

// Commande admin : .darkai on/off, rp on/off
cmd({
  pattern: "darkai ?(.*)?",
  alias: ["dark", "darkgpt"],
  desc: "Activer/désactiver DarkAI et RP",
  category: "ai",
  react: "🌑",
  filename: __filename
}, async (conn, mek, m, { q, reply, react, isCreator }) => {
  if (!isCreator) return reply("❌ Commande réservée au propriétaire.");

  const args = q?.trim().split(/\s+/) || [];

  if (args.length === 0) {
    return reply(`📘 Utilisation :
.darkai on — activer Dark AI
.darkai off — désactiver Dark AI
.darkai rp on — activer mode RP
.darkai rp off — désactiver mode RP`);
  }

  if (args[0] === "on") {
    global.darkAiEnabled = true;
    await react("✅");
    return reply("🌑 *Dark AI activé.*");
  }

  if (args[0] === "off") {
    global.darkAiEnabled = false;
    await react("❌");
    return reply("🌕 *Dark AI désactivé.*");
  }

  if (args[0] === "rp") {
    if (args[1] === "on") {
      global.darkAiRPmode = true;
      await react("👻");
      return reply("🎭 *Mode RP activé.*");
    } else if (args[1] === "off") {
      global.darkAiRPmode = false;
      await react("🛑");
      return reply("🎭 *Mode RP désactivé.*");
    } else {
      return reply("📘 Utilisation : .darkai rp on | .darkai rp off");
    }
  }

  return reply("❓ Commande inconnue. Utilise `.darkai` pour l'aide.");
});

// Réponse auto de DarkAI via Google API
cmd({
  pattern: ".*",
  desc: "Réponse auto de Dark-AI (via Gemini)",
  hidden: true,
  onlyInGroup: false,
  filename: __filename
}, async (conn, mek, m, { reply }) => {
  try {
    if (!global.darkAiEnabled) return;
    if (!m?.body || m.key.fromMe || m.body.startsWith(".")) return;

    const sender = m.sender;
    const userMsg = m.body;

    if (identityTriggers.some(trigger => userMsg.toLowerCase().includes(trigger))) {
      const lang = detectLanguage(userMsg);
      return reply(lang === 'fr' ? identityResponseFR : identityResponseEN);
    }

    if (!global.userChats[sender]) global.userChats[sender] = [];
    global.userChats[sender].push({ author: "user", content: userMsg });

    const prompt = global.darkAiRPmode
      ? "You are DARK-AI, a cryptic and paranormal entity. Respond with enigmatic and unsettling tone."
      : "You are DARK-AI, a witty, intelligent assistant created by Dark-DEv.";

    const payload = {
      prompt: {
        context: prompt,
        messages: global.userChats[sender].slice(-10)
      },
      temperature: 0.7,
      candidate_count: 1,
      top_k: 40,
      top_p: 0.95
    };

    const { data } = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta2/models/chat-bison-001:generateMessage?key=${GOOGLE_API_KEY}`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    const botReply = data?.candidates?.[0]?.content || "🤖 Aucune réponse.";
    global.userChats[sender].push({ author: "bot", content: botReply });

    await reply(botReply);
  } catch (e) {
    console.error("Erreur Dark-AI via Google:", e);
    reply("❌ Erreur avec l'API Google.");
  }
});
