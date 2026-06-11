import { useContext } from "react";
import { StoreContext } from "../context/storeContextDef";

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error(
      "useStore debe usarse dentro de <StoreProvider>. Verifica que el componente esté envuelto correctamente en App.jsx.",
    );
  }
  return ctx;
};
