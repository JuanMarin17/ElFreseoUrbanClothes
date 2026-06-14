const PREFIX = 'ai_session_';
const key = (storeId) => `${PREFIX}${storeId}`;

export const getChatSession = (storeId) =>
  storeId ? (localStorage.getItem(key(storeId)) ?? null) : null;

export const setChatSession = (storeId, sessionId) => {
  if (storeId && sessionId) localStorage.setItem(key(storeId), sessionId);
};

export const clearChatSession = (storeId) => {
  if (storeId) localStorage.removeItem(key(storeId));
};

export const clearAllChatSessions = () => {
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k));
};
