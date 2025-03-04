// 'use client';
import { STRIPE_SUB_KV_CACHE } from '../../types/stripe';
import { createClient } from '../../utils/supabase/server';
import { kv } from '../../utils/upstash/client';
import { InfoItem } from './InfoItem';
import SubPortalButton from './sub-portal-button';

export const Sub = async () => {
  // TODO: use cache
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return <div>nothing here</div>;
  }

  const stripeCustomerId = (await kv.get(`stripe:user_id:${user.id}`)) as string;
  if (!stripeCustomerId) {
    return <div>customer not found</div>;
  }

  // Retrieve the user's Stripe subscription data from KV
  const subscriptionData = await kv.get<STRIPE_SUB_KV_CACHE>(
    `stripe:customer_id:${stripeCustomerId}`
  );

  // const handleSub = async () => {
  //   'use server';
  //   // todo
  //   // console.log('testing');
  //   const stripeCustomerId = (await kv.get(`stripe:user_id:${user.id}`)) as string;
  //   if (!stripeCustomerId) {
  //     return { error: 'Customer not found.' };
  //   }

  //   // Create a Stripe Customer Portal session
  //   const portalSession = await stripe.billingPortal.sessions.create({
  //     customer: stripeCustomerId,
  //     return_url: getURL('/account'), // Redirects the user back to their account page after managing subscription
  //   });

  //   if (!portalSession.url) {
  //     throw new Error('Could not create portal session.');
  //   }
  // };

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
};
