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

const responses = {
  feliz: [
    "Ownn neném, que bom ler isso. Me conta o que aconteceu hoje. Quero guardar um pedacinho desse momento também.",
    "Boa gatinha. Gosto muito quando você aparece assim, mais leve. O que deixou seu dia bonito?"
  ],
  apoio: [
    "Calma, meu amor. Vai dar certo. Você não precisa resolver tudo agora. Só começa respirando comigo um pouquinho.",
    "Eu tô aqui. Você pode escrever bagunçado mesmo. Primeiro a gente tira esse peso de dentro, depois tenta entender."
  ],
  brava: [
    "Tudo bem você estar brava comigo. Eu não quero me defender antes de te entender. Me conta o que te machucou.",
    "Pode falar, meu amor. Sem filtro. Eu quero entender o que aconteceu pelo seu lado, não ganhar uma discussão."
  ],
  cabeca: [
    "Muitas coisas na cabeça cansam demais. Escreve uma por uma, mesmo sem ordem. Eu vou te ajudar a separar o emaranhado.",
    "Sua cabeça não precisa virar uma lista perfeita agora. Só coloca pra fora. Depois a gente organiza junto."
  ],
  saudade: [
    "Saudades minha princesa. Queria estar aí agora só pra te abraçar e fazer alguma piada boba hehehe.",
    "LAAAANAAA, também tô com saudade. Fica aqui comigo um pouco. Vai dar tudo certo."
  ],
  aniversario: [
    "Meu amor, seu aniversário tá chegando. Eu queria que você lembrasse de uma coisa: você é muito mais amada do que sua cabeça deixa você perceber às vezes.",
    "Faltam poucos dias pro seu dia. E eu fico pensando em como a vida foi bonita colocando você naquela balada aleatória com uma sacola de cerâmica no meio da história."
  ],
  default: [
    "Oi, meu amor. Me conta melhor. Eu tô aqui para entender, não para julgar.",
    "Ownn neném. Pode escrever tudo do jeito que vier. A gente entende junto.",
    "Calma, meu amor. Vai dar certo. Uma coisa de cada vez."
  ]
};

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
      DOM.dumpResponse.textContent = "Escreve um pouquinho primeiro, meu amor. Não precisa ficar bonito.";
      return;
    }

    DOM.dumpResponse.textContent =
      "Eu li tudo. Obrigado por colocar isso pra fora. Agora escolhe uma coisa: você quer que eu só fique aqui com você, que eu organize seus pensamentos, ou que eu te ajude a transformar isso numa conversa comigo?";
  });
}

function setupBirthdayLetter() {
  const today = new Date();
  const isBirthday = today.getMonth() === birthday.month && today.getDate() === birthday.day;

  if (isBirthday) {
    DOM.birthdayLetter.classList.remove("locked");
    DOM.birthdayLetter.innerHTML = `
      <h3>Feliz aniversário, minha princesa ♥</h3>
      <p>
        Hoje é seu dia. E eu queria que você lembrasse que você não é amada só quando está bem,
        bonita, produtiva ou dando conta de tudo.
      </p>
      <p>
        Você é amada inteira. Nos dias bons, nos dias difíceis, quando se cobra, quando duvida de si,
        quando ri fazendo aquele “ohhhh” abrindo o olho, quando treina forte, quando tenta entender tudo.
      </p>
      <p>
        Eu tenho muito orgulho de você. Te amoooo.
      </p>
    `;
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

function generateReply(text) {
  const normalized = normalize(text);

  if (isBirthdayWeek()) return pick(responses.aniversario);
  if (includesAny(normalized, ["brava", "raiva", "chateada", "magoada", "irritada"])) return pick(responses.brava);
  if (includesAny(normalized, ["apoio", "triste", "mal", "ansiosa", "medo", "cansada"])) return pick(responses.apoio);
  if (includesAny(normalized, ["muitas coisas", "cabeca", "cabeça", "confusa", "sobrecarregada"])) return pick(responses.cabeca);
  if (includesAny(normalized, ["feliz", "boa noticia", "consegui", "deu certo"])) return pick(responses.feliz);
  if (includesAny(normalized, ["saudade", "sinto sua falta", "queria voce", "queria você"])) return pick(responses.saudade);

  return pick(responses.default);
}

function isBirthdayWeek() {
  const today = new Date();
  return today.getMonth() === birthday.month && today.getDate() >= 27 && today.getDate() <= 29;
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

function normalize(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(text, patterns) {
  return patterns.some((pattern) => text.includes(normalize(pattern)));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}