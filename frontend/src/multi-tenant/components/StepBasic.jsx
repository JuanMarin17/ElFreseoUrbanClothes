export default function StepBasic({ form, handleChange, handleFile }) {
  return (
    <div className="step">
      <input name="name" placeholder="Nombre tienda" onChange={handleChange} />
      <textarea
        name="description"
        placeholder="Descripción"
        onChange={handleChange}
      />

      <label className="upload">
        Subir logo
        <input type="file" onChange={(e) => handleFile(e, "logo")} />
      </label>

      {form.logoPreview && <img src={form.logoPreview} className="preview" />}
    </div>
  );
}
