import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container empty">
      <h1>That campus link wasn’t found.</h1>
      <p>Find your college or add a new campus page.</p>
      <Link prefetch={false} className="primary-button" href="/">
        Find your college →
      </Link>
    </section>
  );
}
