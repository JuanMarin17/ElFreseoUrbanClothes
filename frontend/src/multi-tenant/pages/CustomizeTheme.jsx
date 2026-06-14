import "../components/styles/Store.css";
import useStoreBuilder from "../hooks/UseStoreBuilder";
import { useNavigate } from "react-router-dom";

export default function CustomizeTheme() {
  const { store, updateNested, update } = useStoreBuilder();
  const nav = useNavigate();

  return (
    <div className="page fade">
      <h1>Colores y Tipografía</h1>

      <div className="card">
        <input
          type="color"
          value={store.colors.primary}
          onChange={(e) => updateNested("colors", "primary", e.target.value)}
        />

        <select onChange={(e) => update("font", e.target.value)}>
          <option>Inter</option>
          <option>Roboto</option>
          <option>Poppins</option>
        </select>
      </div>

      <button onClick={() => nav("/components")}>Siguiente</button>
    </div>
  );
}
