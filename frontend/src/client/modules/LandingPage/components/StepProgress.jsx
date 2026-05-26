export default function StepProgress({ currentStep = 1, totalSteps = 3 }) {
  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center", margin: "16px 0" }}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          style={{
            width: 32,
            height: 8,
            borderRadius: 4,
            background: i < currentStep ? "#6c47ff" : "#e0e0e0",
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}