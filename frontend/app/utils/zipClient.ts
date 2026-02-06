export type ZipInput = { name: string; data: string | Blob };

export async function zipFiles(files: ZipInput[]): Promise<Blob> {
  const zip = await import('@zip.js/zip.js');
  const { ZipWriter, BlobWriter, TextReader, BlobReader } = zip as any;

  const writer = new ZipWriter(new BlobWriter('application/zip'));

  for (const f of files) {
    if (typeof f.data === 'string') {
      await writer.add(f.name, new TextReader(f.data));
    } else {
      await writer.add(f.name, new BlobReader(f.data));
    }
  }

  const blob = await writer.close();
  return blob;
}

export function downloadBlob(blob: Blob, filename = 'download.zip') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
