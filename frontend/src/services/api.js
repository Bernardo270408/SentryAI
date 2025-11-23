const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, method = "GET", body = null, auth = true) {
  const headers = { Accept: "application/json" };

  if (body) headers["Content-Type"] = "application/json";

  // Token via localStorage
  const token = localStorage.getItem("token");
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${BASE}${path}`.replace(/([^:]\/)\/+/g, "$1");

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    throw { status: response.status, body: text };
  }

  if (!response.ok) {
    throw { status: response.status, body: data };
  }

  return data;
}

/* ======================================================
   STREAMING: SSE → /ai-messages/send-stream
   ====================================================== */

function streamChatMessage({ message, onChunk, onEnd, onError }) {
  const userId = localStorage.getItem("user_id");
  const openaiToken = localStorage.getItem("openai_token");
  const model = localStorage.getItem("model") || "gpt-4.1-mini";

  const url = `${BASE}/ai-messages/send-stream`
    + `?user_id=${userId}`
    + `&openai_token=${openaiToken}`
    + `&model=${model}`;

  const es = new EventSource(url);

  es.addEventListener("chunk", (event) => {
    const data = JSON.parse(event.data);
    const token = data.token || "";
    onChunk && onChunk(token);
  });

  es.addEventListener("end", () => {
    onEnd && onEnd();
    es.close();
  });

  es.onerror = (err) => {
    onError && onError(err);
    es.close();
  };

  // Enviar mensagem via fetch (mesmo endpoint)
  fetch(url, {
    method: "POST",
    body: JSON.stringify({ message }),
    headers: { "Content-Type": "application/json" },
  });

  return es; // para permitir frontend chamar es.close()
}

// ======================================================
// EXPORTS DE ALTO NÍVEL
// ======================================================

export default {
  request,

  // ---------- AUTH ----------
  login: (email, password) =>
    request("/login/", "POST", { email, password }, false),

  register: (username, email, password) =>
    request("/register/", "POST", { username, email, password }, false),

  // ---------- CHATS ----------
  createChat: (name) =>
    request("/chats/", "POST", { name }),

  getChat: (id) =>
    request(`/chats/${id}`, "GET"),

  getUserChats: (userId) =>
    request(`/chats/user/${userId}`, "GET"),

  deleteChat: (id) =>
    request(`/chats/${id}`, "DELETE"),

  // ---------- MESSAGES ----------
  sendMessage: (chatId, content) =>
    request("/messages/", "POST", { chat_id: chatId, content }),

  getMessages: (chatId) =>
    request(`/messages/${chatId}`, "GET"),

  // ---------- RATING ----------
  getRating: (chatId) =>
    request(`/chats/${chatId}/rating`, "GET"),

  // ---------- STREAMING ----------
  streamChatMessage,
};
