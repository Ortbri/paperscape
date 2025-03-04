'use client';
import { genUserPresignedUrl } from '@/actions/cloudflare/genUserPresignedUrl';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';

function DownloadForm({
  id,
  fileType,
}: {
  id: string;
  fileType: 'dwg-ft' | 'dwg-m' | 'svg' | 'jpg';
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDownloadAction() {
    setIsLoading(true);
    try {
      const { data } = await genUserPresignedUrl({ elementId: id, fileType: fileType });
      if (!data?.downloadUrl) {
        toast.error('Failed to generate download URL');
        return;
      }

      try {
        // Fetch the file content
        const response = await fetch(data.downloadUrl);
        const blob = await response.blob();

        // Create a blob URL to force download
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;

        // Set filename based on type
        const filename =
          fileType === 'dwg-ft'
            ? 'model-ft.dwg'
            : fileType === 'dwg-m'
              ? 'model-m.dwg'
              : `model.${fileType}`;

        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL
        window.URL.revokeObjectURL(blobUrl);

        toast.success('Downloaded', {
          description: 'Your file will be saved to your downloads folder',
          duration: 5000,
        });
      } catch (error) {
        console.error(error);
        toast.error('Failed to download file');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate download URL');
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <Button
      onClick={handleDownloadAction}
      type="submit"
      className="w-full"
      disabled={isLoading}
      variant={'outline'}
    >
      {isLoading ? (
        <>
          Downloading...
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        </>
      ) : (
        <>
          Download {fileType.toUpperCase()} <Download className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export default DownloadForm;

// const saveFile = async (blob, suggestedName) => {
//   // Feature detection. The API needs to be supported
//   // and the app not run in an iframe.
//   const supportsFileSystemAccess =
//     'showSaveFilePicker' in window &&
//     (() => {
//       try {
//         return window.self === window.top;
//       } catch {
//         return false;
//       }
//     })();
//   // If the File System Access API is supported…
//   if (supportsFileSystemAccess) {
//     try {
//       // Show the file save dialog.
//       const handle = await showSaveFilePicker({
//         suggestedName,
//       });
//       // Write the blob to the file.
//       const writable = await handle.createWritable();
//       await writable.write(blob);
//       await writable.close();
//       return;
//     } catch (err) {
//       // Fail silently if the user has simply canceled the dialog.
//       if (err.name !== 'AbortError') {
//         console.error(err.name, err.message);
//       }
//       return;
//     }
//   }
//   // Fallback if the File System Access API is not supported…
//   // Create the blob URL.
//   const blobURL = URL.createObjectURL(blob);
//   // Create the `<a download>` element and append it invisibly.
//   const a = document.createElement('a');
//   a.href = blobURL;
//   a.download = suggestedName;
//   a.style.display = 'none';
//   document.body.append(a);
//   // Programmatically click the element.
//   a.click();
//   // Revoke the blob URL and remove the element.
//   setTimeout(() => {
//     URL.revokeObjectURL(blobURL);
//     a.remove();
//   }, 1000);
// };
