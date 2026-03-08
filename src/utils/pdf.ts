import { jsPDF } from 'jspdf';
import { domToCanvas } from 'modern-screenshot';

export async function generateBadgePDF(badgeElement: HTMLElement, filename: string) {
  const canvas = await domToCanvas(badgeElement, {
    scale: 3,
    backgroundColor: 'transparent'
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [208, 321]
  });

  pdf.addImage(imgData, 'PNG', 0, 0, 208, 321);
  pdf.save(`${filename}.pdf`);
}

export async function generateBulkPDF(badgeElements: HTMLElement[], filename: string, mode: 'single' | 'grid') {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: mode === 'single' ? [208, 321] : 'a4'
  });

  for (let i = 0; i < badgeElements.length; i++) {
    const canvas = await domToCanvas(badgeElements[i], {
      scale: 3,
      backgroundColor: 'transparent'
    });
    const imgData = canvas.toDataURL('image/png');

    if (mode === 'single') {
      if (i > 0) pdf.addPage([208, 321], 'portrait');
      pdf.addImage(imgData, 'PNG', 0, 0, 208, 321);
    } else {
      if (i === 0) {
        pdf.deletePage(1);
        pdf.addPage('a4', 'portrait');
      }
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const bW = 55;
      const bH = 85;
      const margin = 10;
      const cols = Math.floor((pageWidth - margin) / (bW + 5));
      const rows = Math.floor((pageHeight - margin) / (bH + 5));
      const perPage = cols * rows;

      if (i > 0 && i % perPage === 0) {
        pdf.addPage('a4', 'portrait');
      }

      const pageIdx = i % perPage;
      const col = pageIdx % cols;
      const row = Math.floor(pageIdx / cols);

      const x = margin + col * (bW + 5);
      const y = margin + row * (bH + 5);

      pdf.addImage(imgData, 'PNG', x, y, bW, bH);
    }
  }

  pdf.save(`${filename}.pdf`);
}
