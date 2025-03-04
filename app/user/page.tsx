import { Profile } from '@/features/user/profile';
import { Sub } from '@/features/user/sub';
import { Suspense } from 'react';
export default async function UserPage() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2">
      {/* Section 1 */}
      <section className="border-border flex flex-col gap-2 rounded-3xl border p-4">
        <h2 className="text-2xl font-semibold">User Information</h2>
        <Suspense fallback="..loading">
          <Profile />
        </Suspense>
      </section>
      <section className="border-border rounded-3xl border p-4">
        <h2 className="text-2xl font-semibold">Subscription</h2>
        <Suspense fallback="..loading">
          <Sub />
        </Suspense>
      </section>
    </div>
  );
}
