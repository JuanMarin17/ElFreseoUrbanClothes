import { Compass } from "lucide-react";
import ErrorPage from "./ErrorPage";

export default function NotFound404() {
  return (
    <ErrorPage
      code="Error 404"
      icon={<Compass size={28} />}
      title="Esta página no existe"
      message="El enlace que seguiste está roto o la página fue movida. Revisa la dirección o vuelve a un lugar conocido."
      actions={[
        { label: "Ir al inicio", to: "/", primary: true },
        { label: "Ver catálogo", to: "/catalogo" },
      ]}
    />
  );
}
