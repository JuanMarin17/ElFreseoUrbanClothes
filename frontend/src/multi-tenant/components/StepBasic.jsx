const cc = (len, max) => (
  <span style={{ display:"block", textAlign:"right", fontSize:11, marginTop:3, fontFamily:"Inter,sans-serif",
    color: len >= max ? "#ef4444" : len > max * 0.8 ? "#f59e0b" : "#555" }}>
    {len}/{max}
  </span>
);

export default function StepBasic({ form, handleChange, handleFile }) {
  const name = form?.name ?? "";
  const description = form?.description ?? "";
  return (
    <div className="step">
      <input name="name" placeholder="Nombre tienda" onChange={handleChange} maxLength={200} value={name} />
      {cc(name.length, 200)}
      <textarea
        name="description"
        placeholder="Descripción (máx. 280 caracteres)"
        onChange={handleChange}
        rows={4}
        maxLength={200}
        value={description}
        style={{ resize: "none" }}
      />
      {cc(description.length, 200)}

      <label className="upload">
        Subir logo
        <input type="file" onChange={(e) => handleFile(e, "logo")} />
      </label>

      {form.logoPreview && <img src={form.logoPreview} className="preview" />}
    </div>
  );
}

