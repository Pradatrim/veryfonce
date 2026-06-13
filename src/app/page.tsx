import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import SiteFooter from "@/components/SiteFooter";

// Ported 1:1 from viewLanding() in the prototype. The testimonials section only
// renders when there are site reviews (none yet) — matching the original, which
// returns '' when state.siteReviews is empty.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const me = await getCurrentUser();
  const loggedInCreator = Boolean(me && me.role === "CREATOR");
  return (
    <>
      <AppHeader />
      <div className="wrap">
        <div>
          <section className="hero">
            <div className="container">
              <div className="eyebrow">For creators · Built for the bio link</div>
              <h1>
                Showcase what you
                <br />
                <em>actually use</em>
                <span className="hero-mark">
                  <svg
                    className="hero-star"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M 12 2.5 L 14.4 8.8 L 21 9.1 L 15.8 13.2 L 17.6 19.7 L 12 16 L 6.4 19.7 L 8.2 13.2 L 3 9.1 L 9.6 8.8 Z"
                      fill="#6b5318"
                      stroke="url(#fonceStarGrad)"
                      strokeWidth="2.6"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="hero-c">©</span>
                </span>
              </h1>
              <p className="lede">
                Bring in products from anywhere you shop online. Set your own
                prices. Get paid when your audience buys. Fonce handles
                fulfillment, you handle taste.
              </p>
              <div className="hero-actions">
                {loggedInCreator ? (
                  <Link href="/dashboard" className="btn btn-primary btn-shimmer">
                    Go to your dashboard
                  </Link>
                ) : (
                  <Link href="/signup" className="btn btn-primary btn-shimmer">
                    Create your showcase
                  </Link>
                )}
                <Link href="/phone-demo" className="btn">
                  See it on a phone →
                </Link>
              </div>
            </div>
          </section>

          <section className="features">
            <div className="container">
              <div className="features-block">
                <div className="features-grid">
                  <div className="feature">
                    <span className="num">i.</span>
                    <h3>Curate</h3>
                    <p>
                      Bring in products from anywhere you shop online. Add your
                      own photo, set your markup.
                    </p>
                  </div>
                  <div className="feature">
                    <span className="num">ii.</span>
                    <h3>Showcase</h3>
                    <p>
                      Choose a layout that fits your brand. Editorial, grid, or
                      minimal. One link in your bio.
                    </p>
                  </div>
                  <div className="feature">
                    <span className="num">iii.</span>
                    <h3>Earn</h3>
                    <p>
                      Your audience buys at your price. Keep your markup minus a
                      small processing fee. We handle fulfillment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
