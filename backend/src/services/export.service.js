import PDFDocument from 'pdfkit';

export const generateTextReport = (review) => {
  const lines = [
    '='.repeat(60),
    `CODE REVIEW REPORT: ${review.title}`,
    '='.repeat(60),
    `Date: ${review.createdAt}`,
    `Language: ${review.language}`,
    `Quality Score: ${review.qualityScore}/100`,
    `Source: ${review.sourceType}`,
    '',
    'SUMMARY',
    '-'.repeat(40),
    review.summary || 'N/A',
    '',
    'BUGS',
    '-'.repeat(40),
    ...(review.bugs?.length ? review.bugs.map((b, i) => `${i + 1}. ${b}`) : ['None detected']),
    '',
    'SECURITY ISSUES',
    '-'.repeat(40),
    ...(review.securityIssues?.length
      ? review.securityIssues.map((s, i) => `${i + 1}. ${s}`)
      : ['None detected']),
    '',
    'PERFORMANCE TIPS',
    '-'.repeat(40),
    ...(review.performanceTips?.length
      ? review.performanceTips.map((p, i) => `${i + 1}. ${p}`)
      : ['None']),
    '',
    'INLINE COMMENTS',
    '-'.repeat(40),
    ...(review.inlineComments?.map(
      (c) => `Line ${c.line} [${c.severity.toUpperCase()}]: ${c.message}${c.suggestion ? ` → ${c.suggestion}` : ''}`
    ) || ['None']),
    '',
    'MARKDOWN REPORT',
    '-'.repeat(40),
    review.markdownReport || '',
  ];

  return lines.join('\n');
};

export const generatePdfBuffer = (review) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text(`Code Review: ${review.title}`, { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Quality Score: ${review.qualityScore}/100`);
    doc.text(`Language: ${review.language} | Source: ${review.sourceType}`);
    doc.text(`Date: ${new Date(review.createdAt).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(11).text(review.summary || 'N/A', { align: 'justify' });
    doc.moveDown();

    const sections = [
      { title: 'Bugs', items: review.bugs },
      { title: 'Security Issues', items: review.securityIssues },
      { title: 'Performance Tips', items: review.performanceTips },
      { title: 'Best Practices', items: review.bestPractices },
      { title: 'Refactoring Ideas', items: review.refactoringIdeas },
    ];

    sections.forEach(({ title, items }) => {
      if (items?.length) {
        doc.fontSize(14).text(title, { underline: true });
        items.forEach((item, i) => doc.fontSize(11).text(`${i + 1}. ${item}`));
        doc.moveDown();
      }
    });

    if (review.inlineComments?.length) {
      doc.fontSize(14).text('Inline Comments', { underline: true });
      review.inlineComments.forEach((c) => {
        doc
          .fontSize(10)
          .text(
            `Line ${c.line} [${c.severity}]: ${c.message}${c.suggestion ? ` — Fix: ${c.suggestion}` : ''}`
          );
      });
    }

    doc.end();
  });
