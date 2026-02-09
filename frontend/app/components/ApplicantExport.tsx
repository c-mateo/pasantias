import React from 'react';
import { jsPDF } from 'jspdf';
import { zipFiles, downloadBlob } from '../util/zipClient';

type Attachment = { name: string; file: File | Blob };

export default function ApplicantExport({
  applicant,
  attachments = [],
}: {
  applicant: any;
  attachments?: Attachment[];
}) {
  const handleExport = async () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(applicant?.name || 'Applicant', 10, 20);
      doc.setFontSize(11);

      let y = 30;
      const pushLine = (label: string, value?: string) => {
        if (!value) return;
        const lines = doc.splitTextToSize(`${label}: ${value}`, 180);
        doc.text(lines, 10, y);
        y += lines.length * 7;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      };

      pushLine('Email', applicant?.email);
      pushLine('Phone', applicant?.phone);
      pushLine('Location', applicant?.location);
      if (applicant?.summary) pushLine('Summary', applicant.summary);

      if (applicant?.skills && Array.isArray(applicant.skills)) {
        pushLine('Skills', applicant.skills.join(', '));
      }

      if (applicant?.experiences && Array.isArray(applicant.experiences)) {
        const expText = applicant.experiences
          .map((e: any) => {
            if (typeof e === 'string') return `- ${e}`;
            return `- ${e.title || e.role || ''} @ ${e.company || ''} (${e.from || ''} - ${e.to || ''})`;
          })
          .join('\n');
        pushLine('Experiences', expText);
      }

      const pdfBlob = doc.output('blob');

      const files = attachments.map((a) => ({ name: a.name, data: a.file }));
      const safeName = (applicant?.name || 'applicant').replace(/\s+/g, '_');
      files.push({ name: `${safeName}-info.pdf`, data: pdfBlob as Blob });

      const zipBlob = await zipFiles(files);
      downloadBlob(zipBlob, `${safeName}-package.zip`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Export error', err);
      alert('Error al generar el paquete del aplicante');
    }
  };

  return (
    <button type="button" onClick={handleExport} className="h-8 px-3 rounded bg-green-600 text-white">
      Descargar paquete del aplicante
    </button>
  );
}
