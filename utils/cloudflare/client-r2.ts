import { S3Client } from "@aws-sdk/client-s3";

// api key for downloading files from r2
export const r2Download = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_PUBLIC_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_PUBLIC_SECRET_ACCESS_KEY!,
  },
});
