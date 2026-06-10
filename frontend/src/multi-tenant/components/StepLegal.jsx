export default function StepLegal({ handleChange, handleFile }) {
  return (
    <div className="step">
      <input
        name="legalName"
        placeholder="Nombre legal"
        onChange={handleChange}
      />
      <input name="idNumber" placeholder="Documento" onChange={handleChange} />

      <label className="upload">
        Subir documento
        <input type="file" onChange={(e) => handleFile(e, "document")} />
      </label>
    </div>
  );
}
