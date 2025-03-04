import { genAdminPresignedUrl } from '@/actions/cloudflare/genAdminPresignedUrl';
import axios from 'axios';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { UploadElementSchema } from './schema';

interface UploadProgress {
  svg: number;
  jpg: number;
  dwgFt: number;
  dwgM: number;
  thumbnail: number;
}

async function uploadFileWithProgress(
  file: File,
  presignedUrl: string,
  onProgress: (pct: number) => void
): Promise<void> {
  try {
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: progressEvent => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    throw error;
  }
}

export function useFileUpload(form: UseFormReturn<z.infer<typeof UploadElementSchema>>) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    svg: 0,
    jpg: 0,
    dwgFt: 0,
    dwgM: 0,
    thumbnail: 0,
  });

  const handleUpload = async (data: z.infer<typeof UploadElementSchema>) => {
    try {
      const result = await genAdminPresignedUrl(data);

      if (result.serverError) {
        form.setError('root', { message: result.serverError });
        return false;
      }

      const presignedUrls = result.data?.privatePresignedUrls;
      const publicPresignedUrl = result.data?.publicPresignedUrl;

      if (!presignedUrls || !publicPresignedUrl) {
        form.setError('root', { message: 'No presigned URLs returned.' });
        return false;
      }

      const [svgUrl, jpgUrl, dwgFtUrl, dwgMUrl] = presignedUrls;

      await Promise.all([
        data.SVGfile &&
          uploadFileWithProgress(data.SVGfile, svgUrl.presignedUrl, pct =>
            setUploadProgress(prev => ({ ...prev, svg: pct }))
          ),
        data.JPGfile &&
          uploadFileWithProgress(data.JPGfile, jpgUrl.presignedUrl, pct =>
            setUploadProgress(prev => ({ ...prev, jpg: pct }))
          ),
        data.DWGFTfile &&
          uploadFileWithProgress(data.DWGFTfile, dwgFtUrl.presignedUrl, pct =>
            setUploadProgress(prev => ({ ...prev, dwgFt: pct }))
          ),
        data.DWGMfile &&
          uploadFileWithProgress(data.DWGMfile, dwgMUrl.presignedUrl, pct =>
            setUploadProgress(prev => ({ ...prev, dwgM: pct }))
          ),
        data.JPGfile &&
          uploadFileWithProgress(data.JPGfile, publicPresignedUrl, pct =>
            setUploadProgress(prev => ({ ...prev, thumbnail: pct }))
          ),
      ]);

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Upload error:', errorMessage);
      form.setError('root', { message: `An unexpected error: ${errorMessage}` });
      return false;
    }
  };

  const resetProgress = () => {
    setUploadProgress({ svg: 0, jpg: 0, dwgFt: 0, dwgM: 0, thumbnail: 0 });
  };

  return {
    uploadProgress,
    handleUpload,
    resetProgress,
  };
} 