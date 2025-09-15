// src/app/ui/Hero.tsx
export default function Hero({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          background: "linear-gradient(120deg, var(--accent), var(--accent-2))",
          color: "#fff",
          padding: "28px",
        }}
      >
        <h1 style={{ margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ margin: "6px 0 0", opacity: 0.9 }}>{subtitle}</p>
        )}
      </div>
    </section>
  );
}
