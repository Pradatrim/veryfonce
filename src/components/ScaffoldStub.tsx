import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

// Placeholder for routes scaffolded but not yet ported from the prototype.
export default function ScaffoldStub({
  name,
  note,
}: {
  name: string;
  note?: string;
}) {
  return (
    <>
      <SiteHeader />
      <div className="wrap">
        <section className="hero">
          <div className="container">
            <div className="eyebrow">Scaffolded route</div>
            <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 3.6rem)" }}>{name}</h1>
            <p className="lede">
              {note ?? "This page is scaffolded and ready to be ported from the prototype next."}
            </p>
          </div>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
