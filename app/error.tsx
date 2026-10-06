"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container empty">
      <h1>We couldn’t load this page.</h1>
      <p>
        Your saved registration choices stay on this device. Check your
        connection and try again.
      </p>
      <button className="primary-button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
