import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section aria-labelledby="pathway-heading" className="hero">
        <p className="eyebrow">Beginner networking pathway</p>
        <h1 id="pathway-heading">Understand how networks really work</h1>
        <p className="summary">
          Build a clear mental model of the systems that connect people, devices, and the internet.
        </p>
        <Link className="primary-link" href="/paths/networking-foundations">
          Start Networking Foundations
        </Link>
      </section>
    </main>
  );
}
