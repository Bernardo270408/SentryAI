const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, method = "GET", body = null, auth = true) {
  const headers = { Accept: "application/json" };

  if (body) headers["Content-Type"] = "application/json";

  // Token via localStorage
  const token = localStorage.getItem("token");
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  // REMOVE BARRAS DUPLICADAS
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

// ENDPOINTS DE ALTO NÍVEL

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
};