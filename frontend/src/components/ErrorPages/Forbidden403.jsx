import { ShieldAlert } from "lucide-react";
import ErrorPage from "./ErrorPage";

export default function Forbidden403() {
  return (
    <ErrorPage
      code="Error 403"
      icon={<ShieldAlert size={28} />}
      title="No tienes acceso a esta página"
      message="Tu cuenta no cuenta con los permisos necesarios para ver este contenido. Si crees que esto es un error, contacta al administrador de tu tienda."
      actions={[
        { label: "Ir al inicio", to: "/", primary: true },
        { label: "Iniciar sesión con otra cuenta", to: "/login" },
      ]}
    />
  );
}
