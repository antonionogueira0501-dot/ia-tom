const DOM = {
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  moodButtons: document.querySelectorAll("[data-message]"),
  chatForm: document.getElementById("chat-form"),
  messageInput: document.getElementById("message-input"),
  chatHistory: document.getElementById("chat-history"),
  greeting: document.getElementById("time-greeting"),
  dump: document.getElementById("brain-dump"),
  dumpDone: document.getElementById("dump-done"),
  dumpResponse: document.getElementById("dump-response"),
  birthdayLetter: document.getElementById("birthday-letter")
};

const birthday = {
  month: 5,
  day: 29
};

const STORAGE_KEY = "ia-tom-chat-history";

init();

function init() {
  setGreeting();
  setupNavigation();
  setupMoodButtons();
  setupChat();
  setupBrainDump();
  setupBirthdayLetter();
}

function setGreeting() {
  const hour = new Date().getHours();
  let greeting = "Boa noite, meu amor ♥";

  if (hour >= 5 && hour < 12) greeting = "Bom dia, meu amor ♥";
  if (hour >= 12 && hour < 18) greeting = "Boa tarde, meu amor ♥";

  DOM.greeting.textContent = greeting;
}

function setupNavigation() {
  DOM.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const viewName = item.dataset.view;

      DOM.navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");

      DOM.views.forEach((view) => view.classList.remove("active"));

      const target = document.getElementById(`view-${viewName}`);
      if (target) target.classList.add("active");
    });
  });
}

function setupMoodButtons() {
  DOM.moodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const message = button.dataset.message;
      addMessage(message, "user");

      showTyping();

      setTimeout(() => {
        removeTyping();
        addMessage(generateReply(message), "assistant");
      }, 900);
    });
  });
}

function showTyping() {
  removeTyping();

  const row = document.createElement("article");
  row.className = "message-row assistant typing";
  row.id = "typing-indicator";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.innerHTML = "<span>...</span>";

  row.appendChild(bubble);
  DOM.chatHistory.appendChild(row);
  DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing-indicator");
  typing?.remove();
}

function setupChat() {
  DOM.chatForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = DOM.messageInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    DOM.messageInput.value = "";
    autoResize();

    showTyping();

    setTimeout(() => {
      removeTyping();
      addMessage(generateReply(text), "assistant");
    }, 900);
  });

  DOM.messageInput.addEventListener("input", autoResize);
}

function setupBrainDump() {
  DOM.dumpDone.addEventListener("click", () => {
    const text = DOM.dump.value.trim();

    if (!text) {
      DOM.dumpResponse.textContent = sanitizeReply("Escreve um pouquinho primeiro, meu amor. Não precisa ficar bonito.");
      return;
    }

    DOM.dumpResponse.textContent = generateReply(text);
  });
}

function setupBirthdayLetter() {
  const today = new Date();
  const isBirthday = today.getMonth() === birthday.month && today.getDate() === birthday.day;

  if (isBirthday) {
    DOM.birthdayLetter.classList.remove("locked");
    DOM.birthdayLetter.innerHTML = generateBirthdayLetter();
  } else {
    DOM.birthdayLetter.innerHTML = `
      <h3>Carta especial bloqueada ♥</h3>
      <p>
        Essa carta abre no dia 29. Até lá, fica só a promessa:
        tem uma coisa bonita esperando por você.
      </p>
    `;
  }
}

function isBirthdayWeek() {
  const today = new Date();
  return today.getMonth() === birthday.month && today.getDate() >= 27 && today.getDate() <= 29;
}

function normalizeText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function pickOne(array) {
  if (!Array.isArray(array) || !array.length) return "";
  return array[Math.floor(Math.random() * array.length)];
}

function detectIntent(text) {
  const normalized = normalizeText(text);
  const lineBreaks = (String(text || "").match(/\n/g) || []).length;

  const keywordMap = {
    autocritica: ["sou burra", "sou ruim", "nao consigo", "fracassei", "insuficiente", "nao sou capaz", "sou incapaz", "odeio ser assim"],
    conflito: ["brava", "chateada", "magoada", "raiva", "voce fez", "voce nao", "fiquei triste", "irritada", "machucou", "doeu"],
    ansiedade: ["ansiedade", "ansiosa", "nervosa", "medo", "surtar", "preocupada", "futuro", "triste", "mal", "cansada", "apoio"],
    estudo: ["estudar", "prova", "conteudo", "materia", "academia", "foco", "nao sei nada", "faculdade", "revisar"],
    saudade: ["saudade", "sinto sua falta", "queria voce aqui", "falta de voce", "queria voce", "queria te ver"],
    birthday: ["aniversario", "parabens", "meu dia", "carta"],
    memoria: ["lembra", "nosso comeco", "balada", "ceramica", "bete", "hamlet", "devorador", "alienista", "leonardo da vinci"],
    apology: ["desculpa", "foi mal", "perdao", "me perdoa", "sinto muito"],
    reassurance: ["vai dar certo", "me acalma", "me tranquiliza", "preciso ouvir", "promete", "ta tudo bem"],
    carinho: ["amor", "te amo", "carinho", "fofa", "linda", "princesa", "loirinha", "gatinha"],
    greeting: ["oi", "ola", "bom dia", "boa tarde", "boa noite", "e ai", "tudo bem", "quero conversar", "so quero conversar"]
  };

  const worryHits = [
    "medo",
    "ansiosa",
    "preocupada",
    "nao sei",
    "brava",
    "magoada",
    "prova",
    "futuro",
    "cansada",
    "triste"
  ].filter((word) => normalized.includes(word)).length;

  if (String(text || "").length > 280 || lineBreaks >= 3 || (worryHits >= 4 && String(text || "").length > 120) || normalized.includes("muitas coisas na cabeca")) {
    return "brainDump";
  }

  const order = [
    "autocritica",
    "conflito",
    "ansiedade",
    "estudo",
    "saudade",
    "birthday",
    "memoria",
    "apology",
    "reassurance",
    "carinho",
    "greeting"
  ];

  for (let index = 0; index < order.length; index += 1) {
    const intent = order[index];
    if (includesAny(normalized, keywordMap[intent])) return intent;
  }

  if (isBirthdayWeek() && includesAny(normalized, ["feliz", "boa noticia", "consegui", "deu certo"])) {
    return "birthday";
  }

  return "unknown";
}

function getVocabulary(intent) {
  const tom = window.TOM || {};
  const strategy = getStrategy(intent);
  const groups = strategy.vocabulary || [];
  const vocabulary = tom.vocabulary || {};

  return groups.reduce((phrases, group) => phrases.concat(vocabulary[group] || []), []);
}

function getStrategy(intent) {
  const strategies = (window.TOM && window.TOM.responseStrategies) || {};
  return strategies[intent] || strategies.unknown || { vocabulary: [], memoryAllowed: false };
}

function getRelevantMemory(intent, text) {
  const allowedIntents = ["memoria", "saudade", "birthday", "carinho"];
  const memories = (window.TOM && window.TOM.relationshipMemories) || [];
  const normalized = normalizeText(text);

  if (!allowedIntents.includes(intent) || !memories.length) return null;

  const directMatch = memories.find((memory) => {
    return (memory.keywords || []).some((keyword) => normalized.includes(normalizeText(keyword)));
  });

  if (directMatch) return directMatch;

  const possibleMemories = memories.filter((memory) => {
    return (memory.triggerIntents || []).includes(intent);
  });

  if (intent === "memoria") return pickOne(possibleMemories);
  if (intent === "birthday" && Math.random() < 0.7) return pickOne(possibleMemories);
  if ((intent === "saudade" || intent === "carinho") && Math.random() < 0.35) return pickOne(possibleMemories);

  return null;
}

function applyLaughterStyle(text) {
  return String(text || "")
    .replace(/a?ha(ha)+h?/gi, "kkkkk")
    .replace(/a?he(he)+h?/gi, "kkkkk")
    .replace(/\bheh+\b/gi, "kkkkk");
}

function sanitizeReply(text) {
  const boundaries = (window.TOM && window.TOM.boundaries) || {};
  const blocked = boundaries.neverSay || [];
  let reply = applyLaughterStyle(text);

  blocked.forEach((phrase) => {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    reply = reply.replace(new RegExp(escaped, "gi"), "seu sentimento importa pra mim");

    if (normalizeText(reply).includes(normalizeText(phrase))) {
      reply = "Calma meu amor. Seu sentimento importa pra mim. Me conta melhor o que tá acontecendo?";
    }
  });

  return reply
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
}

function generateReply(userText) {
  const intent = detectIntent(userText);
  const strategy = getStrategy(intent);
  const vocabulary = getVocabulary(intent);
  const templates = (window.TOM && window.TOM.replyTemplates && window.TOM.replyTemplates[intent]) || [];
  const fallbackTemplates = (window.TOM && window.TOM.replyTemplates && window.TOM.replyTemplates.unknown) || [
    "Calma meu amor. Me conta melhor, do jeito que vier."
  ];

  let reply = pickOne(templates) || pickOne(fallbackTemplates);
  const tomVocabulary = (window.TOM && window.TOM.vocabulary) || {};
  const replacements = {
    greeting: pickOne(tomVocabulary.greetings || vocabulary),
    affection: pickOne(tomVocabulary.affection || vocabulary),
    humor: pickOne(tomVocabulary.humor || vocabulary),
    saudade: pickOne(tomVocabulary.saudade || vocabulary),
    birthday: pickOne(tomVocabulary.birthday || vocabulary),
    memory: pickOne(tomVocabulary.memory || vocabulary)
  };

  Object.keys(replacements).forEach((key) => {
    reply = reply.replace(new RegExp(`{${key}}`, "g"), replacements[key] || "");
  });

  if (intent === "brainDump") {
    reply = pickOne(((window.TOM || {}).replyTemplates || {}).brainDump) || reply;
  }

  const memory = strategy.memoryAllowed ? getRelevantMemory(intent, userText) : null;
  if (memory && intent === "memoria") {
    return sanitizeReply(`${memory.text} Eu amo quando você lembra dessas coisas nossas.`);
  }

  if (memory) {
    const separator = /[.!?]$/.test(reply) ? " " : ". ";
    reply += `${separator}${memory.text}`;
  }

  return sanitizeReply(reply);
}

function generateBirthdayLetter() {
  const vocabulary = (window.TOM && window.TOM.vocabulary) || {};
  const memories = (window.TOM && window.TOM.relationshipMemories) || [];
  const alienistMemory = memories.find((memory) => memory.id === "buque-alienista") || memories[0];
  const beteMemory = memories.find((memory) => memory.id === "bete-escolheu") || memories[1];
  const title = pickOne(vocabulary.birthday) || "Feliz aniversário, minha princesa";

  return `
    <h3>${sanitizeReply(title)} ♥</h3>
    <p>
      Hoje é seu dia. E eu queria que você lembrasse de uma coisa bem simples:
      você não é amada só quando está bem, bonita, produtiva ou dando conta de tudo.
    </p>
    <p>
      Você é amada inteira. Quando se cobra demais, quando pensa no futuro, quando quer entender todo o conteúdo,
      quando treina intenso, quando fica fofa dmssssss sem perceber e quando só precisa de colo.
    </p>
    <p>
      ${alienistMemory ? sanitizeReply(alienistMemory.text) : "Nosso começo sempre me dá vontade de sorrir kkkkk."}
      ${beteMemory ? sanitizeReply(beteMemory.text) : ""}
    </p>
    <p>
      ${sanitizeReply("Eu tenho muito orgulho de você. Vai simm. Vai dar certo. Te amoooo.")}
    </p>
  `;
}

function addMessage(text, role) {
  const row = document.createElement("article");
  row.className = `message-row ${role}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  const meta = document.createElement("span");
  meta.className = "message-meta";
  meta.textContent = role === "assistant" ? "IA TOM ♥" : "Alana";

  row.appendChild(bubble);
  row.appendChild(meta);
  DOM.chatHistory.appendChild(row);
  DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;
}

function autoResize() {
  DOM.messageInput.style.height = "auto";
  DOM.messageInput.style.height = `${Math.min(DOM.messageInput.scrollHeight, 160)}px`;
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => text.includes(normalizeText(pattern)));
}
