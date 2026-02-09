import React from 'react';
import { zipFiles, downloadBlob } from '../util/zipClient';

type AppDatum = { name: string; content: any };

export default function ZipExport({ appsData }: { appsData: AppDatum[] }) {
  const handleExport = async () => {
    const files = appsData.map((a) => ({ name: `${a.name}.json`, data: JSON.stringify(a.content, null, 2) }));
    try {
      const blob = await zipFiles(files);
      downloadBlob(blob, 'apps-data.zip');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error creating ZIP', err);
      alert('Error al generar ZIP');
    }
  };

  return (
    <button type="button" onClick={handleExport} className="h-8 px-3 rounded bg-blue-600 text-white">
      Exportar apps (ZIP)
    </button>
  );
}
