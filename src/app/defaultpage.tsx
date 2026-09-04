export default function HomePage() {
  const display = {
    fontFamily: "Helvetica Now Display Medium, Helvetica, Arial, sans-serif",
  };
  const body = {
    fontFamily: "Helvetica Now Text, Helvetica, Arial, sans-serif",
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: "#1b4332" }}
    >
      <div className="max-w-2xl">
        <h1
          className="uppercase leading-[0.9] mb-8"
          style={{
            fontSize: "clamp(56px, 10vw, 96px)",
            fontWeight: 500,
            color: "#ffffff",
            letterSpacing: 0,
            ...display,
          }}
        >
          Keep the Momentum
        </h1>

        <div
          className="mx-auto mb-8"
          style={{ width: "48px", height: "1px", backgroundColor: "#3d7a62" }}
        />

        <p
          className="text-[18px] leading-[1.6] mb-12 mx-auto max-w-md"
          style={{ color: "#74b89e", fontWeight: 400, ...body }}
        >
          An object with pedals that can&apos;t move can&apos;t be called a bicycle.
          But give it some momentum? Now we&apos;re getting somewhere.
        </p>

        <a
          href="/trails"
          className="inline-flex items-center justify-center px-8 h-12 text-[16px] font-[500] transition-opacity hover:opacity-75"
          style={{
            backgroundColor: "#ffffff",
            color: "#1b4332",
            borderRadius: "9999px",
            ...display,
          }}
        >
          Explore Trails
        </a>
      </div>
    </main>
  );
}