import Link from "next/link";

// Ported from the prototype <header> + logged-out renderNav(). The brand star
// SVG also defines the `fonceStarGrad` gradient that the hero star reuses.
export default function SiteHeader() {
  return (
    <header>
      <div className="container">
        <nav>
          <div className="nav-left" id="nav-left">
            <Link href="/" className="brand">
              <svg
                className="brand-star"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="fonceStarGrad" cx="35%" cy="28%" r="78%">
                    <stop offset="0%" stopColor="#fce99a" />
                    <stop offset="35%" stopColor="#ecc960" />
                    <stop offset="70%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#7e6520" />
                  </radialGradient>
                </defs>
                <path
                  d="M 12 2.5 L 14.4 8.8 L 21 9.1 L 15.8 13.2 L 17.6 19.7 L 12 16 L 6.4 19.7 L 8.2 13.2 L 3 9.1 L 9.6 8.8 Z"
                  fill="#6b5318"
                  stroke="url(#fonceStarGrad)"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <span className="brand-text">FONCÉ</span>
            </Link>
          </div>
          <div className="nav-actions" id="nav-actions">
            <Link href="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Get started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
