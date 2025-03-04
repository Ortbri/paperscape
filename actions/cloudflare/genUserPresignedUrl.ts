'use server';

import { r2Download } from '@/utils/cloudflare/client-r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DownloadSchema } from '../../components/forms/download/schema';
import { STRIPE_SUB_KV_CACHE } from '../../types/stripe';
import { safeAction } from '../../utils/safe-action';
import { createClient } from '../../utils/supabase/server';
import { kv } from '../../utils/upstash/client';
/* -------------------------------------------------------------------------- */
/*                                  download                                  */
/* -------------------------------------------------------------------------- */
/**
 * TODO:
 * idea to speed up downloads, 
 * 1. add customer id to supabase db
 * 2. cache the query result
 * 3. remove first kv lookup
 * 4. single kv status lookup
 * 5. could potentially cache kv lookup after initia download
 * 6.return signed download url?
 * 
 */
export const genUserPresignedUrl = safeAction(
  DownloadSchema,
  async ({ elementId, fileType }) => {
    const supabase = await createClient(); // check cache
    /**
     * issue every single download you do it goes through a db check to see if you are subbed
     * is there a way to cache the kv?? is that a bad idea lol?
     */
    // Authentication check
    const { data: { user } } = await supabase.auth.getUser(); 
      if (!user) throw new Error('Not authenticated');
    //   check kv for user subscription status
    // const subscriptionStatus = await kv.get(`subscription_status:${user.id}`);
    const stripeCustomerId = (await kv.get(`stripe:user_id:${user.id}`)) as string;
    if (!stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }
    // Retrieve the user's Stripe subscription data from KV
    const subscriptionData = await kv.get<STRIPE_SUB_KV_CACHE>(`stripe:customer_id:${stripeCustomerId}`);
    if (!subscriptionData || subscriptionData.status !== 'active') {
      throw new Error('User is not subscribed');
    }
    const filePaths = {
      svg: `elements/${elementId}/model.svg`,
      jpg: `elements/${elementId}/model.jpg`,
      'dwg-ft': `elements/${elementId}/model-ft.dwg`,
      'dwg-m': `elements/${elementId}/model-m.dwg`,
    };
    // Type-safe file type access
    const key = filePaths[fileType as keyof typeof filePaths];
    if (!key) throw new Error('Invalid file type');
    const command = new GetObjectCommand({
      Bucket: process.env.R2_PRIVATE_BUCKET_NAME!,
      Key: key,
    });

    // Generate presigned URL valid for 1 hour
    const downloadUrl = await getSignedUrl(r2Download, command, { 
      expiresIn: 1000 
    });
    return { downloadUrl };


  }


);