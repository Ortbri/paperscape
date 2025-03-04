'use server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadElementSchema } from '../../components/forms/upload';
import { r2Admin } from '../../utils/cloudflare/admin-r2';
import { safeAction } from '../../utils/safe-action';
import { createClient } from '../../utils/supabase/server';


/* -------------------------------------------------------------------------- */
/*                                presigned url                               */
/* -------------------------------------------------------------------------- */
const baseUrl = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
/**
 * request a presigned url from cloudflare 
 * returns private signed urls for both the public and private bucket
 */
export const genAdminPresignedUrl = safeAction(
  UploadElementSchema,
  async ({ title, SVGfile, JPGfile, DWGFTfile, DWGMfile }) => {
    const supabase = await createClient();

    if (!SVGfile || !JPGfile || !DWGFTfile || !DWGMfile) {
      throw new Error('All files are required');
    }

    const { data, error } = await supabase
      .from('elements')
      .insert({ title })
      .select('element_id')
      .single();

    if (error) throw error;
    if (!data?.element_id) throw new Error('Failed to create element');

    const privateBucket = process.env.R2_PRIVATE_BUCKET_NAME!;
    const publicBucket = process.env.R2_PUBLIC_BUCKET_NAME!;

    const basePath = `elements/${data.element_id}`;

    const files = {
      svg: { file: SVGfile, path: `${basePath}/model.svg` },
      jpg: { file: JPGfile, path: `${basePath}/model.jpg` },
      dwgFt: { file: DWGFTfile, path: `${basePath}/model-ft.dwg` },
      dwgM: { file: DWGMfile, path: `${basePath}/model-m.dwg` },
    };

    const privatePresignedUrls = await Promise.all(
      Object.entries(files).map(async ([, { file, path }]) => {
        const command = new PutObjectCommand({
          Bucket: privateBucket!, // private bucket name!
          Key: path,
          ContentType: file.type,
        });
        return {
          presignedUrl: await getSignedUrl(r2Admin, command, { expiresIn: 3600 }),
          publicUrl: `${baseUrl}/${path}`,
        };
      })
    );

    // thumbnail upload presigned url
    const thumbnailPath = `${basePath}/thumbnail.jpg`;
    const thumbnnail = JPGfile as File;
    const command = new PutObjectCommand({
      Bucket: publicBucket!, // private bucket name!
      Key: thumbnailPath,
      ContentType: thumbnnail.type,
    });

    const devSubDomain = process.env.R2_PUBLIC_BUCKET_URL!;
    const publicPresignedUrl = await getSignedUrl(r2Admin, command, { expiresIn: 3600 });
    // const publicThumbnailUrl = `${baseUrl}/${publicBucket}/${thumbnailPath}`;
    const publicThumbnailUrl = `${devSubDomain}/${thumbnailPath}`; //TODO: THIS IS ONLY FOR DEVELOPMENT LINKS

    await supabase
      .from('elements')
      .update({
        svg_url: privatePresignedUrls[0].publicUrl,
        jpg_url: privatePresignedUrls[1].publicUrl,
        dwg_ft_url: privatePresignedUrls[2].publicUrl,
        dwg_m_url: privatePresignedUrls[3].publicUrl,
        thumbnail_url: publicThumbnailUrl,
      })
      .eq('element_id', data.element_id);

    return {
      privatePresignedUrls,
      publicPresignedUrl,
      publicThumbnailUrl,
    };
  }
);



