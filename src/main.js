const STORAGE_KEYS = {
  settings: "ia-tom-settings",
  memory: "ia-tom-memory",
  history: "ia-tom-history"
};

const defaultSettings = {
  girlfriendName: "Alana",
  boyfriendName: "Tom",
  replyTone: "carinhoso",
  replyMode: "fofo",
  relationshipContext: "Tom tem um jeito brincalhao, gosta de academia e demonstra carinho com presenca, atencao e mensagens simples."
};

const defaultMemory = {
  nicknames: "",
  insideJokes: "",
  importantDates: "",
  specialPlaces: "",
  alanaLikes: "",
  alanaHappy: "",
  alanaIrritates: "",
  alanaDislikes: "",
  commonPhrases: "",
  humorStyle: "",
  affectionStyle: "",
  sensitiveTopics: ""
};

const DOM = {
  chatHistory: document.getElementById("chat-history"),
  chatForm: document.getElementById("chat-form"),
  messageInput: document.getElementById("message-input"),
  settingsForm: document.getElementById("settings-form"),
  toggleSettingsButton: document.getElementById("toggle-settings"),
  settingsPanel: document.getElementById("settings-panel"),
  clearChatButton: document.getElementById("clear-chat")
};

let state = {
  settings: loadSettings(),
  memory: loadMemory(),
  history: loadHistory()
};

initialize();

function initialize() {
  populateForms();

  if (!state.history.length) {
    state.history = [createAssistantWelcomeMessage()];
    saveHistory();
  }

  renderHistory();
  setupEventListeners();
  autoResizeTextarea();
  syncSettingsPanel();
}

function setupEventListeners() {
  DOM.chatForm.addEventListener("submit", handleSendMessage);
  DOM.settingsForm.addEventListener("submit", handleSaveSettings);
  DOM.toggleSettingsButton.addEventListener("click", toggleSettingsPanel);
  DOM.clearChatButton.addEventListener("click", clearChat);
  DOM.messageInput.addEventListener("input", autoResizeTextarea);
  window.addEventListener("resize", syncSettingsPanel);
}

function loadSettings() {
  const saved = safeParse(localStorage.getItem(STORAGE_KEYS.settings));
  const merged = { ...defaultSettings, ...saved };

  return {
    ...merged,
    replyTone: sanitizeSettingOption(merged.replyTone, [
      "carinhoso",
      "engracado",
      "romantico",
      "direto",
      "fofo",
      "maduro",
      "conciliador"
    ], defaultSettings.replyTone),
    replyMode: sanitizeSettingOption(merged.replyMode, [
      "fofo",
      "engracado",
      "romantico",
      "maduro",
      "pedido de desculpas",
      "resolver conflito",
      "saudade",
      "bom dia/boa noite"
    ], defaultSettings.replyMode)
  };
}

function loadMemory() {
  const saved = safeParse(localStorage.getItem(STORAGE_KEYS.memory));
  return { ...defaultMemory, ...saved };
}

function loadHistory() {
  const saved = safeParse(localStorage.getItem(STORAGE_KEYS.history));
  return Array.isArray(saved) ? saved : [];
}

function saveSettings() {
  state.settings = getSettings();
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(state.settings));
}

function saveMemory() {
  state.memory = getMemory();
  localStorage.setItem(STORAGE_KEYS.memory, JSON.stringify(state.memory));
}

function saveHistory() {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history));
}

function getSettings() {
  const formData = new FormData(DOM.settingsForm);
  return {
    girlfriendName: cleanValue(formData.get("girlfriendName")) || defaultSettings.girlfriendName,
    boyfriendName: cleanValue(formData.get("boyfriendName")) || defaultSettings.boyfriendName,
    replyTone: cleanValue(formData.get("replyTone")) || defaultSettings.replyTone,
    replyMode: cleanValue(formData.get("replyMode")) || defaultSettings.replyMode,
    relationshipContext: cleanValue(formData.get("relationshipContext")) || defaultSettings.relationshipContext
  };
}

function getMemory() {
  const formData = new FormData(DOM.settingsForm);
  return {
    nicknames: cleanValue(formData.get("nicknames")),
    insideJokes: cleanValue(formData.get("insideJokes")),
    importantDates: cleanValue(formData.get("importantDates")),
    specialPlaces: cleanValue(formData.get("specialPlaces")),
    alanaLikes: cleanValue(formData.get("alanaLikes")),
    alanaHappy: cleanValue(formData.get("alanaHappy")),
    alanaIrritates: cleanValue(formData.get("alanaIrritates")),
    alanaDislikes: cleanValue(formData.get("alanaDislikes")),
    commonPhrases: cleanValue(formData.get("commonPhrases")),
    humorStyle: cleanValue(formData.get("humorStyle")),
    affectionStyle: cleanValue(formData.get("affectionStyle")),
    sensitiveTopics: cleanValue(formData.get("sensitiveTopics"))
  };
}

function populateForms() {
  DOM.settingsForm.elements.girlfriendName.value = state.settings.girlfriendName;
  DOM.settingsForm.elements.boyfriendName.value = state.settings.boyfriendName;
  DOM.settingsForm.elements.replyTone.value = state.settings.replyTone;
  DOM.settingsForm.elements.replyMode.value = state.settings.replyMode;
  DOM.settingsForm.elements.relationshipContext.value = state.settings.relationshipContext;

  Object.entries(state.memory).forEach(([key, value]) => {
    if (DOM.settingsForm.elements[key]) {
      DOM.settingsForm.elements[key].value = value;
    }
  });
}

function handleSaveSettings(event) {
  event.preventDefault();
  saveSettings();
  saveMemory();

  const confirmation = {
    role: "assistant",
    text: `Pronto. Atualizei minhas referencias sobre voce e ${state.settings.girlfriendName}. Vou responder com mais contexto e no tom ${state.settings.replyTone}.`,
    timestamp: Date.now()
  };

  state.history.push(confirmation);
  saveHistory();
  renderHistory();
}

function handleSendMessage(event) {
  event.preventDefault();

  const userMessage = cleanValue(DOM.messageInput.value);
  if (!userMessage) {
    return;
  }

  const userEntry = {
    role: "user",
    text: userMessage,
    timestamp: Date.now()
  };

  state.history.push(userEntry);
  DOM.messageInput.value = "";
  autoResizeTextarea();
  renderHistory();

  const reply = generateReply(userMessage);
  const assistantEntry = {
    role: "assistant",
    text: reply,
    timestamp: Date.now()
  };

  state.history.push(assistantEntry);
  saveHistory();
  renderHistory();
}

function renderHistory() {
  DOM.chatHistory.innerHTML = "";

  state.history.forEach((message) => {
    const row = document.createElement("article");
    row.className = `message-row ${message.role}`;

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = message.text;

    const meta = document.createElement("span");
    meta.className = "message-meta";
    meta.textContent = message.role === "assistant" ? "IA TOM" : "Voce";

    row.appendChild(bubble);
    row.appendChild(meta);
    DOM.chatHistory.appendChild(row);
  });

  DOM.chatHistory.scrollTop = DOM.chatHistory.scrollHeight;
}

function clearChat() {
  const shouldClear = window.confirm("Deseja limpar o historico da conversa?");
  if (!shouldClear) {
    return;
  }

  state.history = [createAssistantWelcomeMessage()];
  saveHistory();
  renderHistory();
}

function createAssistantWelcomeMessage() {
  return {
    role: "assistant",
    text: `Oi. Eu sou a IA TOM, um assistente inspirado no jeito do ${state.settings.boyfriendName} para te ajudar a escrever com carinho, leveza e sinceridade para ${state.settings.girlfriendName}. Nao sou uma pessoa real, e sim um apoio para montar mensagens afetivas com a energia dele. Me conta a mensagem que voce quer responder ou o clima da conversa.`,
    timestamp: Date.now()
  };
}

function detectIntent(userMessage) {
  const text = normalizeText(userMessage);

  const intents = [
    { type: "bom-dia", patterns: ["bom dia", "dia lindo", "acordei pensando"] },
    { type: "boa-noite", patterns: ["boa noite", "vai dormir", "dorme bem"] },
    { type: "saudade", patterns: ["saudade", "sinto sua falta", "queria voce aqui", "queria voce aqui comigo"] },
    { type: "desculpas", patterns: ["desculpa", "me perdoa", "foi mal", "errei"] },
    { type: "conflito", patterns: ["briga", "discussao", "chateada", "chateado", "brava", "bravo", "sumiu", "magoada", "magoado"] },
    { type: "tristeza", patterns: ["triste", "mal", "pra baixo", "insegura", "inseguro", "ansiosa", "ansioso"] },
    { type: "amor", patterns: ["te amo", "amo voce", "gosto de voce", "voce e importante"] },
    { type: "humor", patterns: ["kkkk", "kkk", "haha", "engracado", "meme", "sem nocao"] },
    { type: "atencao", patterns: ["fala comigo", "me da atencao", "to aqui", "quero voce"] }
  ];

  const match = intents.find((intent) => intent.patterns.some((pattern) => text.includes(pattern)));
  return match ? match.type : "geral";
}

function generateReply(userMessage) {
  const settings = state.settings;
  const memory = state.memory;
  const intent = detectIntent(userMessage);
  const girlfriendName = settings.girlfriendName || "Alana";
  const boyfriendName = settings.boyfriendName || "Tom";
  const petName = pickPreferredPetName(memory, girlfriendName);

  if (containsManipulativeRequest(userMessage)) {
    return `Posso te ajudar a responder sem mexer com os sentimentos da ${girlfriendName} de um jeito injusto. Tenta algo honesto, tipo: "quero falar com voce de verdade e explicar melhor o que eu senti".`;
  }

  const replyMap = {
    "bom-dia": [
      `Bom dia, ${petName}. Espero que seu dia venha leve hoje. O meu ja comeca melhor quando eu vejo mensagem sua.`,
      `Bom dia, meu amor. Passando so pra te lembrar que eu to aqui e que quero ver seu dia ficar bonito desde cedo.`
    ],
    "boa-noite": [
      `Boa noite, ${petName}. Dorme bem, ta? Queria te dar um beijo agora e deixar seu coracao quietinho.`,
      `Boa noite, meu amor. Descansa direitinho e leva meu carinho com voce ate pegar no sono.`
    ],
    "saudade": [
      `Eu tambem to com saudade, ${petName}. Queria estar ai agora so pra ficar pertinho e fazer voce se sentir cuidada.`,
      `Tava sentindo sua falta tambem. Se eu pudesse, ja aparecia ai pra te abracar e roubar uns minutinhos com voce.`
    ],
    "desculpas": [
      `Amor, desculpa de verdade. Eu entendo que isso pode ter te magoado e nao quero passar por cima do que voce sentiu. Quero conversar com calma e fazer melhor.`,
      `Me desculpa se te fiz sentir assim. Voce e importante pra mim e eu quero resolver isso com maturidade, sem fugir da conversa.`
    ],
    "conflito": [
      `Eu entendo que voce tenha ficado assim, ${petName}. Nao quero invalidar o que voce sentiu. Me fala melhor o que te machucou, porque eu quero resolver isso com voce.`,
      `Sei que isso te pegou de um jeito ruim, e eu nao quero ser defensivo. Quero te ouvir direito e ajustar o que for preciso.`
    ],
    "tristeza": [
      `Ei, ${petName}, eu nao quero que voce fique carregando isso sozinha. Seu sentimento faz sentido pra mim e eu to aqui pra te ouvir primeiro, antes de qualquer tentativa de resolver.`,
      `Vem ca. Eu entendo que voce esteja mal, e nao quero diminuir isso. Me conta com calma, porque eu quero estar presente de verdade pra voce.`
    ],
    "amor": [
      `Eu gosto muito de voce tambem, ${petName}. Do seu jeito, da sua energia e desse carinho que voce coloca nas coisas pequenas.`,
      `E eu recebo isso com o maior carinho. Voce e daquelas pessoas que fazem meu dia ficar mais leve so por existir nele.`
    ],
    "humor": [
      `Voce e muito sem nocao kkkkk e talvez seja exatamente por isso que eu gosto tanto de conversar com voce.`,
      `Nao da pra te levar totalmente a serio quando voce vem assim kkkkk, mas eu adoro esse seu jeitinho.`
    ],
    "atencao": [
      `To aqui com voce, ${petName}. Pode falar. Nao quero te deixar sentindo que ta falando sozinha.`,
      `Ei, meu amor, eu to presente. Me diz o que voce ta precisando agora que eu quero te dar atencao de verdade.`
    ],
    "geral": [
      `Eu responderia de um jeito simples e verdadeiro: mostra carinho, fala claro e deixa a ${girlfriendName} sentir que voce ta presente de verdade.`,
      `Isso pode ficar bonito sem soar forcado. Eu iria por uma linha mais natural, com carinho e sinceridade, do jeitinho que o ${boyfriendName} falaria no dia a dia.`
    ]
  };

  let baseReply = pickVariant(replyMap[intent] || replyMap.geral, userMessage);

  if (settings.replyMode === "resolver conflito" && intent === "geral") {
    baseReply = `Eu iria com calma e maturidade: "eu entendo seu lado, nao quero brigar com voce e quero resolver isso de um jeito bom pros dois".`;
  }

  if (settings.replyMode === "pedido de desculpas" && intent === "geral") {
    baseReply = `Se a ideia for pedir desculpas, eu faria assim: "me desculpa de verdade. Eu pensei no que aconteceu e quero te ouvir sem fugir da responsabilidade".`;
  }

  if (settings.replyMode === "saudade" && intent === "geral") {
    baseReply = `Se quiser deixar mais afetivo, eu mandaria algo como: "to com saudade de voce num nivel bem real hoje. Queria seu abraco e seu jeitinho perto de mim".`;
  }

  if (settings.replyMode === "bom dia/boa noite" && intent === "geral") {
    baseReply = `Se a ideia e mandar algo leve, eu faria curto e fofo: "passei so pra te desejar um momento gostoso e te lembrar que voce e especial pra mim".`;
  }

  baseReply = personalizeReply(baseReply, intent, memory, settings);
  return applyTone(baseReply, settings.replyTone);
}

function applyTone(reply, tone) {
  const normalizedReply = reply.trim();

  const toneTransforms = {
    carinhoso: () => normalizedReply.replace("To aqui", "Eu to aqui").replace("Vem ca.", "Vem ca, meu bem."),
    engracado: () => addSentenceIfMissing(normalizedReply, "To aceitando uma risadinha sua junto com isso."),
    romantico: () => addSentenceIfMissing(normalizedReply, "Tem carinho de verdade nisso, sem precisar exagerar."),
    direto: () => normalizedReply.split(". ").slice(0, 2).join(". ").trim(),
    fofo: () => addSentenceIfMissing(normalizedReply, "Queria te deixar abracada nisso agora."),
    maduro: () => normalizedReply.replace("Queria", "Eu queria").replace("To", "Eu to"),
    conciliador: () => addSentenceIfMissing(normalizedReply, "O mais importante pra mim aqui e cuidar do que voce sentiu.")
  };

  return toneTransforms[tone] ? toneTransforms[tone]() : normalizedReply;
}

function personalizeReply(reply, intent, memory, settings) {
  let result = reply;
  const phrase = firstListItem(memory.commonPhrases);
  const happyThing = firstListItem(memory.alanaHappy);
  const specialPlace = firstListItem(memory.specialPlaces);
  const insideJoke = firstListItem(memory.insideJokes);
  const affectionStyle = firstListItem(memory.affectionStyle);

  if (phrase && !normalizeText(result).includes(normalizeText(phrase))) {
    result = addSentenceIfMissing(result, phrase);
  }

  if (intent === "saudade" && specialPlace) {
    result = addSentenceIfMissing(result, `Fiquei ate lembrando de ${specialPlace}`);
  }

  if (intent === "humor" && insideJoke) {
    result = addSentenceIfMissing(result, `Isso me lembrou ${insideJoke}`);
  }

  if ((intent === "bom-dia" || intent === "boa-noite" || intent === "amor") && happyThing) {
    result = addSentenceIfMissing(result, `Tomara que isso te traga aquele sorriso que voce abre quando tem ${happyThing}`);
  }

  if ((intent === "tristeza" || intent === "conflito") && affectionStyle) {
    result = addSentenceIfMissing(result, `Quero te mostrar cuidado do jeito que voce gosta: ${affectionStyle}`);
  }

  if (memory.sensitiveTopics) {
    const sensitive = normalizeText(memory.sensitiveTopics);
    if (sensitive && normalizeText(result).includes(sensitive)) {
      result = `Quero responder com carinho e maturidade, sem tocar num assunto sensivel agora. ${reply}`;
    }
  }

  if (settings.relationshipContext) {
    result = applyRelationshipStyle(result, settings.relationshipContext);
  }

  return result;
}

function applyRelationshipStyle(reply, relationshipContext) {
  const context = normalizeText(relationshipContext);
  let result = reply;

  if (context.includes("academia") || context.includes("treino")) {
    result = addSentenceIfMissing(result, "To na torcida por voce, com aquela energia boa de quem pega firme no treino");
  }

  return result;
}

function pickPreferredPetName(memory, fallbackName) {
  if (!memory.nicknames) {
    return fallbackName;
  }

  return firstListItem(memory.nicknames) || fallbackName;
}

function containsManipulativeRequest(text) {
  const normalized = normalizeText(text);
  const harmfulPatterns = [
    "fazer ciume",
    "manipular",
    "mentir",
    "chantagem",
    "controlar",
    "deixar ela dependente",
    "deixar com medo"
  ];

  return harmfulPatterns.some((pattern) => normalized.includes(pattern));
}

function pickVariant(options, seedText) {
  if (!Array.isArray(options) || !options.length) {
    return "";
  }

  const total = seedText.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return options[total % options.length];
}

function autoResizeTextarea() {
  DOM.messageInput.style.height = "auto";
  DOM.messageInput.style.height = `${Math.min(DOM.messageInput.scrollHeight, 160)}px`;
}

function toggleSettingsPanel() {
  const isCompact = window.innerWidth <= 1120;

  if (isCompact) {
    DOM.settingsPanel.classList.toggle("is-open");
  } else {
    DOM.settingsPanel.classList.toggle("is-collapsed");
  }

  updateSettingsVisibilityState();
}

function syncSettingsPanel() {
  const isCompact = window.innerWidth <= 1120;

  if (isCompact) {
    DOM.settingsPanel.classList.remove("is-collapsed");
    DOM.settingsPanel.classList.remove("is-open");
  } else {
    DOM.settingsPanel.classList.remove("is-open");
    DOM.settingsPanel.classList.remove("is-collapsed");
  }

  updateSettingsVisibilityState();
}

function updateSettingsVisibilityState() {
  const isCompact = window.innerWidth <= 1120;
  const expanded = isCompact
    ? DOM.settingsPanel.classList.contains("is-open")
    : !DOM.settingsPanel.classList.contains("is-collapsed");

  DOM.toggleSettingsButton.textContent = expanded ? "Ocultar configuracoes" : "Abrir configuracoes";
  DOM.toggleSettingsButton.setAttribute("aria-expanded", String(expanded));
  DOM.settingsPanel.setAttribute("aria-hidden", String(!expanded));
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function cleanValue(value) {
  return String(value || "").trim();
}

function safeParse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.warn("Nao foi possivel ler dados salvos:", error);
    return null;
  }
}

function firstListItem(text) {
  return String(text || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .find(Boolean) || "";
}

function addSentenceIfMissing(baseText, extraText) {
  if (!extraText) {
    return baseText;
  }

  const baseNormalized = normalizeText(baseText);
  const extraNormalized = normalizeText(extraText);

  if (baseNormalized.includes(extraNormalized)) {
    return baseText;
  }

  const cleanedExtra = extraText.trim().replace(/[.!?]+$/, "");
  return `${baseText} ${cleanedExtra}.`.trim();
}

function sanitizeSettingOption(value, allowedOptions, fallbackValue) {
  const normalizedValue = normalizeText(value);
  const match = allowedOptions.find((option) => normalizeText(option) === normalizedValue);
  return match || fallbackValue;
}

/*
  Futuramente, a funcao generateReply poderia ser substituida por uma chamada
  a uma API de IA, como OpenAI API, enviando a mensagem da usuaria, as
  configuracoes e a memoria afetiva para um backend seguro.

  Importante: em producao, a chave da API nunca deve ficar no frontend,
  porque isso exporia o segredo para qualquer pessoa que abrir o navegador.
  A arquitetura correta e:
  1. Frontend envia os dados da conversa para o seu backend.
  2. Backend injeta a chave com seguranca.
  3. Backend chama a API de IA e devolve apenas a resposta final.
*/
