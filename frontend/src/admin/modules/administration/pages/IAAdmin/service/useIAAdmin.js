import { useState, useCallback } from "react";
import { sendChat, getSessions, getSessionHistory } from "./iaService";

function getRole() {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) return localStorage.getItem("userRole") || null;
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload.role || localStorage.getItem("userRole") || null;
  } catch {
    return localStorage.getItem("userRole") || null;
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
  const role = getRole();
  const hasAccess = role === "ADMIN" || role === "OWNER";

  const [sessionId, setSessionId]         = useState(null);
  const [messages, setMessages]           = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [inputText, setInputText]         = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [sessions, setSessions]           = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

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
            message_id:              `bot-${Date.now()}`,
            role:                    "assistant",
            content:                 response.message,
            action:                  response.action ?? null,
            action_data:             response.action_data ?? null,
            enhanced_image_base64:   response.enhanced_image_base64 ?? null,
            enhanced_image_mime_type: response.enhanced_image_mime_type ?? null,
            originalImagePreviewUrl: imagePreviewUrl,
            created_at:              new Date().toISOString(),
          },
        ]);
      } catch (err) {
        const status = err.status;
        if (status === 401) {
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

  return {
    hasAccess,
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
    sendMessage,
    loadSessions,
    loadSession,
    newConversation,
  };
}
