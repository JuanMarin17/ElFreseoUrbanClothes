import { AlertTriangle } from "lucide-react";
import ErrorPage from "./ErrorPage";

export default function ServerError500({ details }) {
  return (
    <ErrorPage
      code="Error 500"
      icon={<AlertTriangle size={28} />}
      title="Algo salió mal"
      message="Ocurrió un error inesperado al cargar esta página. Intenta recargar; si el problema sigue, vuelve más tarde."
      details={details}
      actions={[
        { label: "Recargar página", onClick: () => window.location.reload(), primary: true },
        { label: "Ir al inicio", to: "/" },
      ]}
    />
  );
}
