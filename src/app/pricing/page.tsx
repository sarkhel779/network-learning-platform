import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="informational-page" id="main-content">
      <p className="eyebrow">Learning options</p>
      <h1>Pricing</h1>
      <p className="summary">
        Start with the published free lessons, then choose the depth that fits your learning goals.
      </p>
      <div className="information-grid">
        <section>
          <h2>Free lessons</h2>
          <p>Learn the core concepts through the public beginner lessons at no cost.</p>
        </section>
        <section>
          <h2>Individual premium modules</h2>
          <p>Focus on one deeper networking topic when those modules become available.</p>
        </section>
        <section>
          <h2>Complete-pathway access</h2>
          <p>Follow the full sequence of deeper modules when the complete pathway opens.</p>
        </section>
      </div>
      <p><strong>Premium modules are opening after the learning preview.</strong></p>
      <p>Questions about the learning options? <Link href="/contact">Contact the instructor</Link>.</p>
    </main>
  );
}
