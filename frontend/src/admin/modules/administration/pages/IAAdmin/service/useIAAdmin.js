import { useState, useEffect, useCallback } from "react";
import { sendChat, getSessions, getSessionHistory, deleteSession, deleteAllSessions } from "./iaService";
import { checkIsOwner } from "../../../../../../multi-tenant/pages/services/storeService";

const ALLOWED_ROLES = new Set(["OWNER", "ADMIN", "STORE_USER"]);

function getUserIdFromJwt() {
  const jwt = localStorage.getItem("jwt");
  if (!jwt || jwt === "null") return null;
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload.user_id ?? payload.userId ?? payload.sub ?? payload.id ?? null;
  } catch {
    return null;
  }
}

function getStoredRole() {
  // Store-specific role (OWNER, STORE_USER, ADMIN) takes priority over JWT global role (USER)
  const stored = localStorage.getItem("userRole");
  if (stored && stored !== "null") return stored;
  const jwt = localStorage.getItem("jwt");
  if (!jwt) return null;
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function useIAAdmin() {
  const [role, setRole]                   = useState(() => getStoredRole());
  const [hasAccess, setHasAccess]         = useState(() => ALLOWED_ROLES.has(getStoredRole()));
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Verifica el rol contra la BD (GET /stores/{storeId}/isOwner/{userId}) —
  // la misma llamada que usa StorePage para decidir si mostrar el panel admin.
  // El localStorage solo se usa como valor optimista mientras esto resuelve.
  useEffect(() => {
    let active = true;
    const storeId = localStorage.getItem("storeId");
    const userId  = getUserIdFromJwt();

    if (!storeId || storeId === "null" || !userId) {
      setCheckingAccess(false);
      return;
    }

    checkIsOwner(storeId, userId)
      .then((res) => {
        if (!active) return;
        const resolvedRole = res === true ? "OWNER" : String(res ?? "").toUpperCase();
        setRole(resolvedRole || null);
        setHasAccess(ALLOWED_ROLES.has(resolvedRole));
      })
      .catch(() => {
        if (!active) return;
        setRole(null);
        setHasAccess(false);
      })
      .finally(() => { if (active) setCheckingAccess(false); });

    return () => { active = false; };
  }, []);

  const [sessionId, setSessionId]         = useState(null);
  const [messages, setMessages]           = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [inputText, setInputText]         = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sessions, setSessions]           = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [toastError, setToastError]       = useState(null);

  const addErrorMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        message_id: `err-${Date.now()}`,
        role: "assistant",
        content: text,
        isError: true,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const sendMessage = useCallback(
    async (text) => {
      const txt = (text ?? inputText).trim();
      if (!txt || isLoading) return;

      let imageBase64    = null;
      let imageMimeType  = "image/jpeg";
      let imagePreviewUrl = null;

      if (selectedImage) {
        try {
          imageBase64     = await toBase64(selectedImage);
          imageMimeType   = selectedImage.type || "image/jpeg";
          imagePreviewUrl = URL.createObjectURL(selectedImage);
        } catch {
          // image conversion failed — send text only
        }
      }

      const userMsg = {
        message_id: `user-${Date.now()}`,
        role: "user",
        content: txt,
        imagePreviewUrl,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setSelectedImage(null);
      setIsLoading(true);

      try {
        const response = await sendChat({
          session_id:      sessionId,
          message:         txt,
          image_base64:    imageBase64,
          image_mime_type: imageMimeType,
        });

        if (!sessionId && response.session_id) {
          setSessionId(response.session_id);
        }

        setMessages((prev) => [
          ...prev,
          {
            message_id:                `bot-${Date.now()}`,
            role:                      "assistant",
            content:                   response.message,
            action:                    response.action ?? null,
            action_data:               response.action_data ?? null,
            enhanced_image_base64:     response.enhanced_image_base64 ?? null,
            enhanced_image_mime_type:  response.enhanced_image_mime_type ?? null,
            generated_image_base64:    response.generated_image_base64 ?? null,
            generated_image_mime_type: response.generated_image_mime_type ?? "image/jpeg",
            report_base64:             response.report_base64    ?? null,
            report_mime_type:          response.report_mime_type ?? null,
            report_filename:           response.report_filename  ?? null,
            originalImagePreviewUrl:   imagePreviewUrl,
            created_at:                new Date().toISOString(),
          },
        ]);
      } catch (err) {
        const status = err.status;
        if (status === 429) {
          setToastError(err.message || "Demasiadas peticiones, intenta de nuevo más tarde.");
        } else if (status === 401) {
          addErrorMessage("Sesión expirada. Por favor inicia sesión nuevamente.");
        } else if (status === 403) {
          addErrorMessage("No tienes permisos para usar el asistente de IA.");
        } else if (status === 400) {
          setSessionId(null);
          addErrorMessage(
            "La sesión no fue encontrada. Se inició una nueva conversación."
          );
        } else {
          addErrorMessage(err.message || "Ocurrió un error, intenta de nuevo.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [inputText, isLoading, sessionId, selectedImage]
  );

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadSession = useCallback(
    async (id) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
        const history = await getSessionHistory(id);
        setSessionId(id);
        setMessages(Array.isArray(history) ? history : []);
      } catch {
        addErrorMessage("No se pudo cargar el historial de esta conversación.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const newConversation = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setInputText("");
    setSelectedImage(null);
  }, []);

  const removeSession = useCallback(
    async (id) => {
      setSessions((prev) => prev.filter((s) => s !== id));
      if (sessionId === id) {
        setSessionId(null);
        setMessages([]);
      }
      try {
        await deleteSession(id);
      } catch {
        loadSessions();
      }
    },
    [sessionId, loadSessions]
  );

  const removeAllSessions = useCallback(async () => {
    setSessions([]);
    setSessionId(null);
    setMessages([]);
    try {
      await deleteAllSessions();
    } catch {
      loadSessions();
    }
  }, [loadSessions]);

  return {
    hasAccess,
    checkingAccess,
    role,
    sessionId,
    messages,
    isLoading,
    inputText,
    setInputText,
    selectedImage,
    setSelectedImage,
    sessions,
    sessionsLoading,
    toastError,
    setToastError,
    sendMessage,
    loadSessions,
    loadSession,
    newConversation,
    removeSession,
    removeAllSessions,
  };
}
