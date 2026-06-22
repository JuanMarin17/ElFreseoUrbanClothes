/**
 * useCreateStore.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook que orquesta el flujo completo de creación de tienda:
 *
 *  1. Llama a POST /api/stores        → crea la tienda y obtiene el storeId
 *  2. Llama a POST /api/stores/:id/settings → guarda la configuración del wizard
 *
 * Diseñado para usarse en CreateStore.jsx (paso de términos y confirmación final).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import {
  createStore,
  saveStoreSettings,
} from "../pages/services/storeService.js";
import { clearAllChatSessions } from "../../utils/chatSession.js";

/**
 * @typedef {Object} CreateStoreResult
 * @property {boolean}  loading   – true mientras se ejecutan las peticiones
 * @property {string|null} error  – mensaje de error si algo falla
 * @property {string|null} storeId – UUID devuelto por el backend al crear la tienda
 * @property {Function} submit    – función principal a llamar desde el formulario
 * @property {Function} clearError
 */

/**
 * @param {Object} storeContext  – estado completo del StoreContext (state)
 * @param {string} ownerId       – UUID del usuario autenticado (desde auth)
 * @returns {CreateStoreResult}
 */
export default function useCreateStore(storeContext, ownerId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storeId, setStoreId] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  /**
   * Ejecuta la creación de la tienda y guarda toda la configuración del wizard.
   *
   * @param {{ name: string, subdomain: string, accepted: boolean }} storeForm
   *   – datos del último paso (términos y nombre de tienda)
   */
  const submit = useCallback(
    async (storeForm) => {
      setError(null);
      setLoading(true);

      try {
        // ── Paso 1: Crear la tienda ──────────────────────────────────────────
        // POST /api/stores
        // Construimos el slug a partir del subdominio (ya viene limpio del form)
        const slug = storeForm.subdomain
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        const storePayload = {
          ownerId,
          name: storeForm.name.trim(),
          slug,
          description: storeContext.basic?.description ?? "",
          cms: buildCmsPayload(storeContext.cms),
        };
        
        console.log("📦 storePayload:", JSON.stringify(storePayload, null, 2));
        console.log(
          "📦 settingsPayload:",
          JSON.stringify(buildSettingsPayload(storeContext), null, 2),
        );

        const storeResponse = await createStore(storePayload);
        const createdStoreId = storeResponse.storeId ?? storeResponse.id;
        setStoreId(createdStoreId);

        // Persiste en localStorage para que el header y el admin los lean
        localStorage.setItem("storeId", createdStoreId);
        localStorage.setItem("userRole", "OWNER");
        clearAllChatSessions();

        // ── Paso 2: Guardar configuración completa del wizard ────────────────
        const settingsPayload = buildSettingsPayload(storeContext);
        await saveStoreSettings(createdStoreId, settingsPayload);

        return createdStoreId;
      } catch (err) {
        // Errores de validación field-level (400)
        if (err.errors) {
          const firstError = Object.values(err.errors)[0];
          setError(firstError ?? err.message);
        } else {
          setError(
            err.message ?? "Error al crear la tienda. Intenta nuevamente.",
          );
        }
        throw err; // re-lanzamos para que el componente también pueda reaccionar
      } finally {
        setLoading(false);
      }
    },
    [ownerId, storeContext],
  );

  return { loading, error, storeId, submit, clearError };
}

// ─── Helpers de normalización ────────────────────────────────────────────────

function normalizeFeatures(features) {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  try {
    const parsed = JSON.parse(features);
    if (Array.isArray(parsed)) return parsed;
    return Object.entries(parsed)
      .filter(([, v]) => v !== false && v !== null && v !== "")
      .map(([k]) => k);
  } catch {
    return String(features).split(",").map((s) => s.trim()).filter(Boolean);
  }
}

function normalizeItems(items) {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  return String(items).split(",").map((s) => s.trim()).filter(Boolean);
}

// ─── Builder interno ───────────────────────────────────────────────────────────

/**
 * Normaliza el CMS del StoreContext al DTO que espera POST /api/v1/stores.
 * Corrige nombres de campo y tipos (team→teamSize, list→items, days string→number).
 */
function buildCmsPayload(cms) {
  if (!cms) return undefined;

  return {
    about: cms.about ? {
      headline:     cms.about.headline     ?? "",
      story:        cms.about.story        ?? "",
      mission:      cms.about.mission      ?? "",
      vision:       cms.about.vision       ?? "",
      founded:      cms.about.founded      ?? "",
      teamSize:     cms.about.teamSize     ?? "",
      showTeam:     cms.about.showTeam     ?? true,
      showTimeline: cms.about.showTimeline ?? false,
    } : undefined,

    contact: cms.contact ? {
      email:       cms.contact.email       ?? "",
      phone:       cms.contact.phone       ?? "",
      whatsapp:    cms.contact.whatsapp    ?? "",
      instagram:   cms.contact.instagram   ?? "",
      tiktok:      cms.contact.tiktok      ?? "",
      hours:       cms.contact.hours       ?? "",
      formTitle:   cms.contact.formTitle   ?? "",
      formSubtitle:cms.contact.formSubtitle?? "",
      showForm:    cms.contact.showForm    ?? true,
      showSocials: cms.contact.showSocials ?? true,
    } : undefined,

    locations: cms.locations ? {
      showMap: cms.locations.showMap ?? true,
      items: (cms.locations.items ?? []).map((loc, i) => ({
        name:      loc.name      ?? "",
        address:   loc.address   ?? "",
        city:      loc.city      ?? "",
        phone:     loc.phone     ?? "",
        hours:     loc.hours     ?? "",
        mapUrl:    loc.mapUrl    ?? "",
        isPrimary: loc.isPrimary ?? false,
        sortOrder: i,
      })),
    } : undefined,

    returns: cms.returns ? {
      title:          cms.returns.title          ?? "",
      intro:          cms.returns.intro          ?? "",
      days:           Number(cms.returns.days)   || 30,
      conditions:     cms.returns.conditions     ?? "",
      process:        cms.returns.process        ?? "",
      exceptions:     cms.returns.exceptions     ?? "",
      refundMethod:   cms.returns.refundMethod   ?? "original",
      allowExchanges: cms.returns.allowExchanges ?? true,
      allowRefunds:   cms.returns.allowRefunds   ?? true,
      requireReceipt: cms.returns.requireReceipt ?? false,
      contactEmail:   cms.returns.contactEmail   ?? "",
    } : undefined,

    faq: cms.faq ? {
      pageTitle:    cms.faq.pageTitle    ?? "",
      pageSubtitle: cms.faq.pageSubtitle ?? "",
      showSearch:   cms.faq.showSearch   ?? true,
      items: (cms.faq.items ?? []).map((item, i) => ({
        question:  item.question  ?? "",
        answer:    item.answer    ?? "",
        category:  item.category  ?? "general",
        sortOrder: i,
      })),
    } : undefined,
  };
}

/**
 * Convierte el estado del StoreContext al DTO que espera StoreSettingsController.
 * Mapeo basado en StoreSettingsRequestDTO.java
 */
function buildSettingsPayload(state) {
  return {
    // Campo obligatorio (NotNull en el backend)
    completedStep: state.completedStep ?? 4,

    // Plan seleccionado (paso 1)
    plan: state.plan
      ? {
          id: state.plan.id,
          name: state.plan.name,
          price: state.plan.price,
          features: normalizeFeatures(state.plan.features),
        }
      : undefined,

    // Información básica de la tienda (paso 2)
    basic: state.basic
      ? {
          name: state.basic.name,
          description: state.basic.description ?? "",
          logoPreview: state.basic.logoPreview ?? null,
        }
      : undefined,

    // Componentes: header, banner, footer (paso de customización)
    components: state.components
      ? {
          banner: state.components.banner
            ? {
                title: state.components.banner.title ?? "",
                font: state.components.banner.font ?? "Inter",
                size: String(state.components.banner.size ?? "60"),
                color: state.components.banner.color ?? "#ffffff",
                bg: state.components.banner.bg ?? "#000000",
                // El backend espera un solo String "image"
                // state.components.banner.image ya es string (URL Cloudinary)
                image: state.components.banner.image ?? null,
              }
            : undefined,
          header: state.components.header
            ? {
                logo: state.components.header.logo ?? "",
                items: normalizeItems(state.components.header.items),
                font: state.components.header.font ?? "Inter",
                size: state.components.header.size ?? 16,
                color: state.components.header.color ?? "#ffffff",
                bg: state.components.header.bg ?? "#000000",
              }
            : undefined,
          footer: state.components.footer
            ? {
                text: state.components.footer.text ?? "",
                font: state.components.footer.font ?? "Inter",
                size: String(state.components.footer.size ?? "13"),
                color: state.components.footer.color ?? "#888888",
                bg: state.components.footer.bg ?? "#080808",
              }
            : undefined,
        }
      : undefined,

    // Layout seleccionado (paso 3)
    layout: state.layout
      ? {
          id: state.layout.id,
          title: state.layout.title ?? "",
          description: state.layout.description ?? "",
          img: state.layout.img ?? null,
        }
      : undefined,

    // Información legal (paso 3)
    legal: state.legal
      ? {
          legalName: state.legal.legalName ?? "",
          idNumber: state.legal.idNumber ?? "",
          documentName: state.legal.documentName ?? null,
        }
      : undefined,

    // Métodos de pago y envío (paso 4)
    payment: state.payment
      ? {
          paymentMethod: state.payment.paymentMethod ?? "",
          shipping: state.payment.shipping ?? "",
        }
      : undefined,

    // Estilos visuales (JSON libre → JSONB en PostgreSQL)
    styles: state.styles ?? undefined,

    // Preview: se almacena tal cual
    preview: state.preview ?? undefined,
  };
}
