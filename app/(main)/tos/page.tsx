'use client';

function Tos() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-24">
      <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>

      <div className="prose dark:prose-invert">
        <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using Paperscape.io, you agree to be bound by these Terms of Service.
        </p>

        <h2 className="text-xl font-semibold">2. Use License</h2>
        <p className="mb-4">
          We grant you a limited, non-exclusive, non-transferable license to access and use our 2D
          drawings for personal and educational purposes.
        </p>

        <h2 className="text-xl font-semibold">3. Restrictions</h2>
        <p className="mb-4">
          You may not redistribute, sell, or modify any drawings obtained through our service
          without explicit permission.
        </p>

        <h2 className="text-xl font-semibold">4. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to modify these terms at any time. Continued use of the service
          constitutes acceptance of updated terms.
        </p>
      </div>
    </div>
  );
}

export default Tos;
