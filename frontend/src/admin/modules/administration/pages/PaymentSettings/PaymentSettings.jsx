import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getOAuthStatus, disconnectOAuth } from "../../../../../multi-tenant/pages/services/checkoutService.js";
import "./PaymentSettings.css";

export default function PaymentSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tenantId = localStorage.getItem("storeId");

  const [oauthData, setOauthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const run = async () => {
      const callbackStatus = searchParams.get("status");
      if (callbackStatus === "connected") {
        showToast("success", "¡Cuenta de MercadoPago conectada exitosamente!");
        setSearchParams({}, { replace: true });
      } else if (callbackStatus === "error") {
        const errMsg = searchParams.get("message") ?? "Error al conectar MercadoPago.";
        showToast("error", errMsg);
        setSearchParams({}, { replace: true });
      }
    };
    run();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!tenantId) { setLoading(false); return; }
      setLoading(true);
      try {
        const data = await getOAuthStatus(tenantId);
        setOauthData(data);
      } catch (err) {
        showToast("error", err.message ?? "No se pudo cargar el estado de pagos.");
        setOauthData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tenantId]);

  const handleConnect = () => {
    if (!oauthData?.authorizationUrl) return;
    window.location.href = oauthData.authorizationUrl;
  };

  const handleDisconnect = async () => {
    if (!tenantId) return;
    setDisconnecting(true);
    try {
      await disconnectOAuth(tenantId);
      setOauthData((prev) => ({ ...prev, connected: false, authorizationUrl: prev?.authorizationUrl }));
      showToast("success", "Cuenta desconectada correctamente.");
    } catch (err) {
      showToast("error", err.message ?? "Error al desconectar la cuenta.");
    } finally {
      setDisconnecting(false);
    }
  };

  const isConnected = oauthData?.connected === true;

  return (
    <div className="ps-container">
      {toast && (
        <div className={`ps-toast ps-toast--${toast.type}`}>{toast.msg}</div>
      )}

      <div className="ps-header">
        <h1 className="ps-title">Pasarela de pagos</h1>
        <p className="ps-subtitle">
          Conecta tu cuenta de MercadoPago para recibir pagos de tus clientes.
        </p>
      </div>

      {!tenantId ? (
        <div className="ps-alert ps-alert--warn">
          No se encontró el ID de tu tienda. Asegúrate de haber iniciado sesión correctamente.
        </div>
      ) : loading ? (
        <div className="ps-loading">
          <div className="ps-spinner" />
          <span>Cargando configuración de pagos...</span>
        </div>
      ) : (
        <>
          <div className="ps-card">
            <div className="ps-card__header">
              <div className="ps-mp-logo">
                <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="#009EE3" />
                  <path d="M12 36c0-11 9-20 20-20s20 9 20 20" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
                  <circle cx="32" cy="36" r="5" fill="#fff" />
                </svg>
              </div>
              <div className="ps-card__info">
                <p className="ps-card__name">MercadoPago</p>
                <span className={`ps-badge ${isConnected ? "ps-badge--green" : "ps-badge--gray"}`}>
                  {isConnected ? "Conectado" : "Sin conectar"}
                </span>
              </div>
            </div>

            <p className="ps-card__desc">
              {isConnected
                ? "Tu cuenta de MercadoPago está activa. Los clientes pueden pagar con tarjeta, transferencia y más métodos de pago disponibles en Colombia."
                : "Conecta tu cuenta para empezar a recibir pagos. Serás redirigido a MercadoPago para autorizar la conexión de forma segura."}
            </p>

            <div className="ps-card__actions">
              {isConnected ? (
                <button
                  className="ps-btn ps-btn--danger"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? "Desconectando..." : "Desconectar cuenta"}
                </button>
              ) : (
                <button
                  className="ps-btn ps-btn--primary"
                  onClick={handleConnect}
                  disabled={!oauthData?.authorizationUrl}
                >
                  Conectar MercadoPago →
                </button>
              )}
            </div>
          </div>

          <div className="ps-info-box">
            <p className="ps-info-title">¿Cómo funciona?</p>
            <ul className="ps-info-list">
              <li>Conecta tu cuenta de MercadoPago con un clic.</li>
              <li>Los clientes pagan con tarjeta, PSE, Nequi, efectivo y más.</li>
              <li>El dinero llega directamente a tu cuenta de MercadoPago.</li>
              <li>Puedes desconectar tu cuenta en cualquier momento desde aquí.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
