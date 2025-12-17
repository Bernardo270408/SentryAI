const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 1. Função request centralizada
async function request(path, method = "GET", body = null, auth = true, isFormData = false) {
  const headers = { Accept: "application/json" };

  if (body && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("token");
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  // Garante que não haja barras duplas na URL (ex: //api), exceto no protocolo http://
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
    // Se o parse falhar, armazena o texto cru
    data = { error: text || response.statusText };
  }

  if (!response.ok) {
    // --- LÓGICA DE EXPULSÃO ---
    if (response.status === 401 || (response.status === 403 && data?.force_logout)) {
        
        // Se houver detalhes do banimento, salvamos para mostrar na tela
        if (data.ban_details) {
            localStorage.setItem("ban_info", JSON.stringify(data.ban_details));
            window.location.href = "/banned"; // Redireciona para página de banido
        } else {
            // Logout comum (token expirado ou 401 simples)
            window.location.href = "/";
        }

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        throw { status: response.status, body: { error: "Sessão encerrada." } };
    }
    // --------------------------------------------------------------

    throw { status: response.status, body: data };
  }

  return data;
}

// 2. STREAMING: Fetch com ReadableStream
async function streamChatMessage({ chatId, content, onChunk, onEnd, onError }) {
  const token = localStorage.getItem("token");
  const model = "gemini-2.5-flash";

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
      // Verifica se o erro no stream também é de banimento
      if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
          return;
      }
      const errText = await response.text();
      throw new Error(errText || response.statusText);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split("\n");
      buffer = lines.pop(); 

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

// EXPORTS
export default {
  request,

  // ---------- AUTH ----------
  login: (email, password) => request("/login", "POST", { email, password }, false),
  register: (username, email, password) => request("/users/", "POST", { name: username, email, password }, false),

  // ---------- CHATS ----------
  createChat: (name) => request("/chats/", "POST", { name }),
  getChat: (id) => request(`/chats/${id}`, "GET"),
  getUserChats: (userId) => request(`/chats/user/${userId}`, "GET"),
  deleteChat: (id) => request(`/chats/${id}`, "DELETE"),

  // ---------- MESSAGES ----------
  sendMessage: (chatId, content) => request("/messages/", "POST", { chat_id: chatId, content }),
  getUserMessages: (chatId) => request(`/messages/chat/${chatId}`, "GET"),
  getAIMessages: (chatId) => request(`/ai-messages/chat/${chatId}`, "GET"),

  // ---------- RATING ----------
  getRating: (chatId) => request(`/chats/${chatId}/rating`, "GET"),

  // ---------- CONTRACT ANALYSIS ----------
  analyzeContract: (formData) => request("/contract/analyze", "POST", formData, true, true),
  
  getContract: (id) => request(`/contract/${id}`, "GET"), 
  
  chatContract: (data) => request("/contract/chat", "POST", data),
  getUserContracts: (userId) => request(`/contract/user/${userId}`, "GET"),
  
  // ---------- DASHBOARD & USER ----------
  getDashboardStats: () => request("/dashboard/stats", "GET"),
  updateUser: (userId, data) => request(`/users/${userId}`, "PUT", data),

  // ---------- DOCUMENTS (JusBrasil Mock/API) ----------
  // Adicionado para suportar a página RightsExplorer.jsx
  searchDocuments: (query) => request(`/documents/search?q=${encodeURIComponent(query)}`, "GET"),

  // ---------- STREAMING ----------
  streamChatMessage,

  sendAppeal: (email, message) => request("/users/appeal", "POST", { email, message }, false), // auth=false
  
  getAppeals: () => request("/admin/appeals", "GET"),
  
  resolveAppeal: (userId, action) => request(`/admin/appeal/${userId}/resolve`, "POST", { action }),
};