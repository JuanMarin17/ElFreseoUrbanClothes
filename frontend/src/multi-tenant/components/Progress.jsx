export default function Progress({ step }) {
  return (
    <div className="progress">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={`dot ${i <= step ? "active" : ""}`} />
      ))}
    </div>
  );
}
