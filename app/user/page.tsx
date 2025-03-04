// app/user/page.tsx

import { Button } from '@/components/ui/button';
import { InfoItem } from '@/features/user/InfoItem';
import SubPortalButton from '@/features/user/sub-portal-button';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { STRIPE_SUB_KV_CACHE } from '../../types/stripe';
import { createClient } from '../../utils/supabase/server';
import { kv } from '../../utils/upstash/client';

// Define data fetching functions
async function getProfileData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) {
    redirect('/error');
  }

  return profile;
}

async function getSubscriptionData() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: 'User not found', subscriptionData: null };
  }

  const stripeCustomerId = (await kv.get(`stripe:user_id:${user.id}`)) as string;
  if (!stripeCustomerId) {
    return { error: 'Customer not found', subscriptionData: null };
  }

  // Retrieve the user's Stripe subscription data from KV
  const subscriptionData = await kv.get<STRIPE_SUB_KV_CACHE>(
    `stripe:customer_id:${stripeCustomerId}`
  );

  return { subscriptionData, error: null };
}

// Define component rendering functions
async function UserProfileSection() {
  const profile = await getProfileData();
  const isAdmin = profile.role === 'admin';

  return (
    <div className="flex flex-col gap-2">
      <InfoItem label="Name" value={`${profile.first_name} ${profile.last_name}`} />
      <InfoItem label="Email" value={profile.email} />
      <InfoItem label="User ID" value={profile.user_id} />
      {isAdmin && <InfoItem label="Role" value={profile.role} />}
      {isAdmin && (
        <div className="flex items-start pt-3">
          <Link href="/dashboard">
            <Button className="rounded-3xl">Admin Dashboard</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

async function UserSubscriptionSection() {
  
  const { subscriptionData, error } = await getSubscriptionData();

  if (error === 'User not found') {
    return <div>nothing here</div>;
  }

  if (error === 'Customer not found') {
    return <div>customer not found</div>;
  }

  return (
    <div className="flex flex-col">
      {subscriptionData && subscriptionData.status !== 'none' ? (
        <div className="flex flex-col gap-2">
          <InfoItem
            label="Subscription Id"
            value={subscriptionData.subscriptionId?.toString() || 'N/A'}
          />
          <InfoItem label="Status" value={subscriptionData.status} />
          <InfoItem label="Price Id" value={subscriptionData.priceId?.toString() || 'N/A'} />
          <InfoItem
            label="Current Period Start"
            value={subscriptionData.currentPeriodStart?.toString() || 'N/A'}
          />
          <InfoItem
            label="Current Period End"
            value={subscriptionData.currentPeriodEnd?.toString() || 'N/A'}
          />
          <InfoItem
            label="Cancel At Period End"
            value={subscriptionData.cancelAtPeriodEnd.toString()}
          />
          <InfoItem
            label="Payment Method"
            value={`${subscriptionData.paymentMethod?.brand} ending in ${subscriptionData.paymentMethod?.last4}`}
          />
          {/* client side button to customer portal */}
          <div className="flex items-start pt-3">
            <SubPortalButton />
          </div>
        </div>
      ) : (
        <div>No subscription data found</div>
      )}
    </div>
  );
}

// Main page component
export default async function UserPage() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2">
      {/* Section 1 */}
      <section className="border-border flex flex-col gap-2 rounded-3xl border p-4">
        <h2 className="text-2xl font-semibold">User Information</h2>
        <Suspense fallback="..loading">\
          <UserProfileSection />
        </Suspense>
      </section>
      <section className="border-border rounded-3xl border p-4">
        <h2 className="text-2xl font-semibold">Subscription</h2>
        <Suspense fallback="..loading">
          <UserSubscriptionSection />
        </Suspense>
      </section>
    </div>
  );
}
