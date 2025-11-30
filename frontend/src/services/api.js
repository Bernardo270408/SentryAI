const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 1. Função request ATUALIZADA (suporta FormData para upload de arquivos)
async function request(path, method = "GET", body = null, auth = true, isFormData = false) {
  const headers = { Accept: "application/json" };

  // Se não for FormData, define JSON. 
  // Se for FormData, o browser define o Content-Type (multipart) automaticamente.
  if (body && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("token");
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${BASE}${path}`.replace(/([^:]\/)\/+/g, "$1");

  const response = await fetch(url, {
    method,
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
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
   STREAMING: Fetch com ReadableStream (Restaurado)
   ====================================================== */
async function streamChatMessage({ chatId, content, onChunk, onEnd, onError }) {
  const token = localStorage.getItem("token");
  
  // Define o modelo padrão (usando o 2.5 flash conforme você queria)
  const model = localStorage.getItem("model") || "gemini-2.5-flash-preview-09-2025"; 

  const url = `${BASE}/ai-messages/send-stream`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "Accept": "text/event-stream",
      },
      body: JSON.stringify({
        chat_id: chatId,
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
    
    onEnd && onEnd();

  } catch (err) {
    console.error("Stream error:", err);
    onError && onError(err);
  }
}

// ======================================================
// EXPORTS (Incluindo os novos métodos de contrato)
// ======================================================

export default {
  request,

  // ---------- AUTH ----------
  login: (email, password) => request("/login/", "POST", { email, password }, false),
  register: (username, email, password) => request("/register/", "POST", { username, email, password }, false),

  // ---------- CHATS ----------
  createChat: (name) => request("/chats/", "POST", { name }),
  getChat: (id) => request(`/chats/${id}`, "GET"),
  getUserChats: (userId) => request(`/chats/user/${userId}`, "GET"),
  deleteChat: (id) => request(`/chats/${id}`, "DELETE"),

  // ---------- MESSAGES ----------
  sendMessage: (chatId, content) => request("/messages/", "POST", { chat_id: chatId, content }),
  getMessages: (chatId) => request(`/messages/${chatId}`, "GET"),

  // ---------- RATING ----------
  getRating: (chatId) => request(`/chats/${chatId}/rating`, "GET"),

  // ---------- CONTRACT ANALYSIS (NOVO) ----------
  // Passamos isFormData = true aqui
  analyzeContract: (formData) => request("/contract/analyze", "POST", formData, true, true),
  
  chatContract: (data) => request("/contract/chat", "POST", data),
  getDashboardStats: () => request("/dashboard/stats", "GET"),

  // ---------- STREAMING ----------
  streamChatMessage,
};