import { jsPDF } from 'jspdf';

interface PDFOptions {
  title: string;
  content: string;
  filename: string;
  type?: string;
  metadata?: Record<string, string>;
}

export const generateBrandedPDF = async ({ title, content, filename, type, metadata: _metadata }: PDFOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Let's create an elegant, ultra-premium style.
  // Colors
  const colors = {
    dark: [10, 10, 11] as [number, number, number],      // Sleek black 
    indigo: [79, 70, 229] as [number, number, number],   // Indigo 600
    gray: [130, 130, 132] as [number, number, number],   // Subtle text
    light: [250, 250, 250] as [number, number, number],  // Off-white
  };

  const drawPremiumHeader = async (pdf: jsPDF) => {
    // Top exact border
    pdf.setFillColor(colors.indigo[0], colors.indigo[1], colors.indigo[2]);
    pdf.rect(0, 0, pw, 6, 'F');

    // Header background
    pdf.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    pdf.rect(0, 6, pw, 32, 'F');

    // Logo & BIZ PLUS brand
    try {
      const img = new Image();
      img.src = '/icon.png';

      // Attempt load (will often be synchronous or cached if drawn multiple pages, but async on standard execution)
      await new Promise<void>((resolve) => {
        if (img.complete) resolve();
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });

      if (img.complete && img.naturalWidth > 0) {
        pdf.addImage(img, 'PNG', margin, 12, 16, 16);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.setTextColor(255, 255, 255);
        pdf.text('BIZ PLUS', margin + 22, 24);
      } else {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.setTextColor(255, 255, 255);
        pdf.text('BIZ PLUS', margin, 24);
      }
    } catch {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(255, 255, 255);
      pdf.text('BIZ PLUS', margin, 24);
    }

    // Right-aligned header texts
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(colors.indigo[0], colors.indigo[1], colors.indigo[2]);
    pdf.text('VISION 2050 ALIGNED', pw - margin, 18, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text('INTELLIGENCE ECOSYSTEM REPORT', pw - margin, 26, { align: 'right' });

    // Watermark
    pdf.saveGraphicsState();
    const gState = new (pdf as any).GState({ opacity: 0.03 });
    pdf.setGState(gState);
    pdf.setFontSize(80);
    pdf.setTextColor(0, 0, 0);
    pdf.text('BIZ PLUS', pw / 2, ph / 2 + 20, { align: 'center', angle: 45 });
    pdf.restoreGraphicsState();
  };

  // Build first page header
  await drawPremiumHeader(doc);

  let currentY = 56;

  // Render the Title cleanly
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);

  const splitTitle = doc.splitTextToSize(title, pw - (margin * 2));
  doc.text(splitTitle, margin, currentY);
  currentY += (splitTitle.length * 10) + 4;

  // Metadata Block (Very sleek tabular style)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colors.indigo[0], colors.indigo[1], colors.indigo[2]);
  doc.text(`REPORT TYPE: ${type ? type.toUpperCase() : 'GENERAL INTELLIGENCE'}`, margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colors.gray[0], colors.gray[1], colors.gray[2]);
  doc.text(`GENERATED: ${new Date().toLocaleString('en-IN').toUpperCase()}`, pw - margin, currentY, { align: 'right' });

  currentY += 8;

  // Stylish divider
  doc.setDrawColor(220, 225, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pw - margin, currentY);
  currentY += 12;

  // Content Paragraphs
  doc.setTextColor(40, 40, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setLineHeightFactor(1.6);

  const paragraphs = content.split('\n');

  for (let p of paragraphs) {
    if (p.trim() === '') {
      currentY += 5; // Spacing for empty lines
      continue;
    }

    // Checking if it looks like a bold header (e.g. "Summary:")
    const isHeader = p.endsWith(':') && p.split(' ').length < 5;

    if (isHeader) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(colors.indigo[0], colors.indigo[1], colors.indigo[2]);
      currentY += 4;
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 55);
    }

    const splitP = doc.splitTextToSize(p, pw - (margin * 2));

    for (let line of splitP) {
      if (currentY > ph - 30) {
        doc.addPage();
        await drawPremiumHeader(doc);
        currentY = 56;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 55);
      }
      doc.text(line, margin, currentY);
      currentY += isHeader ? 7 : 6;
    }

    if (isHeader) {
      currentY += 2;
    }
  }

  // Draw identical high-end footers for all pages
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Bottom border
    doc.setFillColor(colors.indigo[0], colors.indigo[1], colors.indigo[2]);
    doc.rect(0, ph - 2, pw, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 185);
    doc.text(
      `© ${new Date().getFullYear()} BIZ PLUS ECOSYSTEM. STRICTLY CONFIDENTIAL.`,
      margin,
      ph - 8
    );

    doc.text(
      `${i} // ${pageCount}`,
      pw - margin,
      ph - 8,
      { align: 'right' }
    );
  }

  doc.save(`${filename}.pdf`);
};
