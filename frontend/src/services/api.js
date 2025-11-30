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
   STREAMING: Fetch com ReadableStream (Compatível com POST + Auth)
   ====================================================== */

async function streamChatMessage({ chatId, content, onChunk, onEnd, onError }) {
  const token = localStorage.getItem("token");
  
  // MODELO PADRÃO ATUALIZADO PARA GEMINI 2.0 FLASH (Mais rápido e maior cota)
  // Se preferir o 2.5 flash, pode usar: "gemini-2.5-flash"
  const model = localStorage.getItem("model") || "gemini-2.5-flash-preview-09-2025"; 

  const url = `${BASE}/ai-messages/send-stream`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Envia o Token corretamente
        "Accept": "text/event-stream",
      },
      body: JSON.stringify({
        chat_id: chatId,  // Backend espera snake_case
        content: content, 
        model: model      
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || response.statusText);
    }

    // Leitura do Stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Processar linhas SSE (data: ...)
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Mantém o resto incompleto no buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6).trim();
          
          if (dataStr === "[DONE]") {
            onEnd && onEnd();
            return;
          }

          try {
            const data = JSON.parse(dataStr);
            // Backend envia { token: "texto" } ou { error: "..." }
            if (data.token) {
              onChunk && onChunk(data.token);
            } else if (data.error) {
              throw new Error(data.error);
            }
          } catch (e) {
            console.warn("Erro ao fazer parse do chunk SSE:", e);
          }
        }
      }
    }
    
    // Finalizar se sair do loop normalmente
    onEnd && onEnd();

  } catch (err) {
    console.error("Stream error:", err);
    onError && onError(err);
  }
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