// Shown instead of the app when required build-time env vars are missing,
// so a misconfigured deploy shows an explanation instead of a blank screen.
export function ConfigError() {
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        fontFamily: "system-ui, sans-serif",
        background: "#1c1410",
        color: "#f8f1e7",
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>W3BB Shop isn't configured yet</h1>
        <p style={{ color: "#c2ac95", marginBottom: "1rem" }}>
          This deploy is missing <code>VITE_SUPABASE_URL</code> and/or{" "}
          <code>VITE_SUPABASE_ANON_KEY</code>. Vite bakes these in at build time, so they need to be
          set as build environment variables wherever this app is hosted (Cloudflare, etc.), then the
          app needs to be rebuilt and redeployed.
        </p>
        <p style={{ color: "#c2ac95" }}>See the README's "Supabase setup" section for where to find these values.</p>
      </div>
    </div>
  );
}
