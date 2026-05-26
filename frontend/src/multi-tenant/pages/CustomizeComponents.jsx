import { useNavigate } from "react-router-dom";

export default function CustomizeComponents() {
  const nav = useNavigate();

  return (
    <div className="page fade">
      <h1>Componentes</h1>

      <div className="card">
        <p>Header</p>
        <p>Footer</p>
        <p>Productos</p>
      </div>

      <button onClick={() => nav("/banner")}>Siguiente</button>
    </div>
  );
}
