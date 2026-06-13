import { cookies, headers } from "next/headers";
import { getCurrentUser, COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Plain-English login diagnostic. Visit /whoami while "logged in" and read the
// lines back — they pinpoint whether the cookie is set, sent, and valid.
export default async function WhoAmI() {
  const cookieVal = cookies().get(COOKIE_NAME)?.value ?? null;
  const user = await getCurrentUser();
  const host = headers().get("host") ?? "(unknown)";
  const authSecretSet = Boolean(process.env.AUTH_SECRET);
  const proto = headers().get("x-forwarded-proto") ?? "(unknown)";

  const Row = ({ label, value, good }: { label: string; value: string; good?: boolean }) => (
    <p style={{ margin: "0.6rem 0" }}>
      {label}:{" "}
      <strong style={{ color: good === undefined ? "#f5efe4" : good ? "#6dd391" : "#ff6b6b" }}>
        {value}
      </strong>
    </p>
  );

  return (
    <main style={{ minHeight: "100vh", padding: "3rem 1.5rem", color: "#f5efe4", fontFamily: "ui-monospace, monospace", maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", marginBottom: "1.5rem" }}>Login check</h1>
      <div style={{ background: "#161616", border: "1px solid rgba(212,175,55,0.3)", borderRadius: 16, padding: "1.5rem" }}>
        <Row label="1. Session cookie present in this request" value={cookieVal ? "YES" : "NO"} good={Boolean(cookieVal)} />
        <Row label="2. Recognized as logged in" value={user ? `YES — @${user.username} (${user.role})` : "NO"} good={Boolean(user)} />
        <Row label="3. AUTH_SECRET configured in Vercel" value={authSecretSet ? "YES" : "NO (using fallback)"} />
        <Row label="4. Web address you're on" value={host} />
        <Row label="5. Protocol" value={proto} />
      </div>
      <p style={{ marginTop: "1.5rem", opacity: 0.65, fontSize: "0.9rem" }}>
        Copy lines 1–5 and send them over — that tells me exactly what to fix.
      </p>
    </main>
  );
}
