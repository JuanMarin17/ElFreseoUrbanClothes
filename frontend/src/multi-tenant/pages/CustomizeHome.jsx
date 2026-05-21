import { useNavigate } from "react-router-dom";

export default function CustomizeHome() {
  const nav = useNavigate();

  return (
    <div className="page fade">
      <h1>Vista general</h1>

      <div className="preview-box">
        <p>Vista previa de tienda</p>
      </div>

      <button onClick={() => nav("/theme")}>Siguiente</button>
    </div>
  );
}
