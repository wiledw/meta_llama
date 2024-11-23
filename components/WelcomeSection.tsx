import Link from "next/link";

export function WelcomeSection() {
  return (
    <section className="text-center mt-16">
      <h1 className="text-4xl font-bold mb-4">Welcome to TravelApp!</h1>
      <p className="text-muted-foreground text-lg">
        Plan your perfect journey with us
      </p>
      <Link href="/map">
        <button
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          Go to Map
        </button>
      </Link>
    </section>
  );
}
