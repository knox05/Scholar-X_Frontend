function PanelHero({ eyebrow, title, subtitle, image = "teacher" }) {
  const teacherSvg = (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#f0e9ff" />
          <stop offset="100%" stopColor="#d8c7ff" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="180" rx="16" fill="url(#g1)" />
      <circle cx="240" cy="48" r="20" fill="#8d65f6" opacity="0.2" />
      <circle cx="274" cy="80" r="12" fill="#8d65f6" opacity="0.3" />
      <rect x="24" y="40" width="132" height="86" rx="12" fill="#fff" />
      <rect x="34" y="54" width="88" height="10" rx="5" fill="#cbb7ff" />
      <rect x="34" y="72" width="110" height="8" rx="4" fill="#e4d9ff" />
      <rect x="34" y="88" width="98" height="8" rx="4" fill="#e4d9ff" />
      <rect x="182" y="96" width="110" height="48" rx="10" fill="#fff" />
      <rect x="194" y="108" width="72" height="8" rx="4" fill="#cab5ff" />
      <rect x="194" y="122" width="56" height="8" rx="4" fill="#e4d9ff" />
    </svg>
  );

  const studentSvg = (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="g2" x1="0" x2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ece4ff" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="180" rx="16" fill="url(#g2)" />
      <rect x="24" y="34" width="126" height="92" rx="14" fill="#fff" />
      <rect x="38" y="48" width="80" height="8" rx="4" fill="#b999ff" />
      <rect x="38" y="64" width="94" height="8" rx="4" fill="#e2d6ff" />
      <rect x="38" y="80" width="64" height="8" rx="4" fill="#e2d6ff" />
      <circle cx="234" cy="70" r="32" fill="#8d65f6" opacity="0.14" />
      <circle cx="246" cy="76" r="16" fill="#8d65f6" opacity="0.28" />
      <rect x="176" y="110" width="104" height="26" rx="13" fill="#8d65f6" />
      <rect x="196" y="119" width="64" height="8" rx="4" fill="#f5f0ff" />
    </svg>
  );

  return (
    <section className="hero-card">
      <div>
        <p className="hero-eyebrow">{eyebrow}</p>
        <h2 className="hero-title">{title}</h2>
        <p className="hero-subtitle">{subtitle}</p>
      </div>
      <div className="hero-illustration">{image === "student" ? studentSvg : teacherSvg}</div>
    </section>
  );
}

export default PanelHero;
