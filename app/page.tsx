export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--paper)",
        color: "var(--ink)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "var(--ink)",
            color: "var(--paper)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          M
        </div>
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          MARK Intelligence
        </span>
      </div>
    </main>
  );
}
