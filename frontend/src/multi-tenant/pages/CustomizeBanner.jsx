import useStoreBuilder from "../hooks/UseStoreBuilder";

export default function CustomizeBanner() {
  const { updateNested } = useStoreBuilder();

  return (
    <div className="page fade">
      <h1>Banner</h1>

      <input
        placeholder="Título"
        onChange={(e) => updateNested("banner", "title", e.target.value)}
      />

      <input
        placeholder="Subtítulo"
        onChange={(e) => updateNested("banner", "subtitle", e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => updateNested("banner", "image", e.target.files[0])}
      />
    </div>
  );
}
