import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

const numberToWords = (num) => {
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const numToIndWords = (n) => {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' hundred ' + numToIndWords(n % 100);
    if (n < 100000) return numToIndWords(Math.floor(n / 1000)) + ' thousand ' + numToIndWords(n % 1000);
    if (n < 10000000) return numToIndWords(Math.floor(n / 100000)) + ' lakh ' + numToIndWords(n % 100000);
    return numToIndWords(Math.floor(n / 10000000)) + ' crore ' + numToIndWords(n % 10000000);
  };

  const result = numToIndWords(Math.round(num));
  return result ? result.trim() : 'Zero';
};

export const generateBillPDF = (billData, settings, download = true) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  
  const { 
    items, customItems = [], subtotal = 0, discount = 0, total = 0,
    customerName = 'Customer', customerPhone = '', date = new Date(), billNo = 'N/A', paymentMode = 'Cash', notes = ''
  } = billData || {};
  
  const { 
    shopName = 'PAVAN MOBILE WORLD', 
    address = 'G85P+CC4, Madhavapuri Hills, PJR Enclave, PJR Layout, Miyapur, Hyderabad-500050', 
    phone = '7337573732', 
    gstin = '',
    billFooter = 'Thank You For Your Purchase' 
  } = settings || {};

  // 1. BRANDING (PAVAN MOBILE WORLD)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(0, 0, 0);
  doc.text(shopName.toUpperCase(), W / 2, 22, { align: 'center' });
  
  // Tagline
  doc.setFontSize(10);
  doc.text('ACCESSORIES | REPAIRS | SERVICES', W / 2, 28, { align: 'center' });
  
  // Address & Contact Info Block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const splitAddress = doc.splitTextToSize(address, W - 40);
  doc.text(splitAddress, W / 2, 34, { align: 'center' });
  doc.text(`Phone: ${phone} ${gstin ? '| GSTIN: ' + gstin : ''}`, W / 2, 34 + (splitAddress.length * 4), { align: 'center' });

  // Divider Line
  let currentY = 38 + (splitAddress.length * 4);
  doc.setLineWidth(0.4);
  doc.line(15, currentY, W - 15, currentY);

  // 2. METADATA ROW (Bill No, Date, Customer)
  currentY += 10;
  doc.setFontSize(11);
  
  // Bill No
  doc.setFont('helvetica', 'normal');
  doc.text('Bill No.', 15, currentY);
  const bNoWidth = doc.getTextWidth('Bill No.');
  doc.line(17 + bNoWidth, currentY + 1, 15 + bNoWidth + 30, currentY + 1);
  doc.setFont('helvetica', 'bold');
  doc.text(String(billNo), 19 + bNoWidth, currentY);
  
  // Date
  doc.setFont('helvetica', 'normal');
  doc.text('Date:', 85, currentY);
  const dateWidth = doc.getTextWidth('Date:');
  doc.line(87 + dateWidth, currentY + 1, 85 + dateWidth + 30, currentY + 1);
  doc.setFont('helvetica', 'bold');
  doc.text(new Date(date).toLocaleDateString(), 89 + dateWidth, currentY);

  // Customer Name
  doc.setFont('helvetica', 'normal');
  doc.text('Customer Name:', 135, currentY);
  const cNameWidth = doc.getTextWidth('Customer Name:');
  doc.line(137 + cNameWidth, currentY + 1, W - 15, currentY + 1);
  doc.setFont('helvetica', 'bold');
  doc.text(customerName, 139 + cNameWidth, currentY);

  // 3. ITEMS TABLE
  currentY += 8;
  const allItems = [
    ...(items || []).map((item) => [
      item.name + (item.warranty && item.warranty !== 'No Warranty' ? `\n(Warranty: ${item.warranty})` : ''), 
      item.qty, 
      item.price.toFixed(2), 
      item.total.toFixed(2)
    ]),
    ...(customItems || []).map((item) => [
      item.name + (item.warranty && item.warranty !== 'No Warranty' ? `\n(Warranty: ${item.warranty})` : ''), 
      item.qty, 
      item.price.toFixed(2), 
      item.total.toFixed(2)
    ]),
  ];

  // Fill up to 10 rows to match the physical receipt feel
  while (allItems.length < 10) {
    allItems.push(['', '', '', '']);
  }

  // Show Subtotal + Discount + Total breakdown if discount applied
  if (discount > 0) {
    allItems.push([
      '',
      { content: 'Subtotal', styles: { fontStyle: 'normal', halign: 'right', textColor: [100, 100, 100] } },
      '',
      { content: subtotal.toFixed(2), styles: { halign: 'right', textColor: [100, 100, 100] } }
    ]);
    allItems.push([
      '',
      { content: 'Discount', styles: { fontStyle: 'bold', halign: 'right', textColor: [200, 0, 0] } },
      '',
      { content: `- ${discount.toFixed(2)}`, styles: { fontStyle: 'bold', halign: 'right', textColor: [200, 0, 0] } }
    ]);
  }

  // Final Net Total Row
  allItems.push([
    '',
    { content: 'Total', styles: { fontStyle: 'bold', halign: 'right' } },
    '',
    { content: total.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } }
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Item', 'Qty', 'Rate', 'Amount']],
    body: allItems,
    theme: 'grid',
    styles: { 
      fontSize: 10, 
      cellPadding: 3.5, 
      lineColor: [0, 0, 0], 
      lineWidth: 0.25,
      textColor: [30, 30, 30],
      font: 'helvetica'
    },
    headStyles: { 
      fillColor: [248, 248, 248], 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: 15, right: 15 }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // 4. AMOUNT IN WORDS
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Amount in Words:', 15, currentY);
  const words = capitalizeWords(numberToWords(Math.round(total))) + ' Only';
  doc.setFont('helvetica', 'bold');
  const wordsWidth = doc.getTextWidth(words);
  doc.text(words, 51, currentY);
  doc.setLineWidth(0.2);
  doc.line(51, currentY + 1, W - 15, currentY + 1);

  // 5. SIGNATURES & SEAL
  currentY += 25;
  
  // Left: Customer Signature
  doc.setFont('helvetica', 'normal');
  doc.line(15, currentY - 5, 75, currentY - 5);
  doc.setFont('helvetica', 'bold');
  doc.text(customerName.toUpperCase(), 15, currentY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Customer's Signature", 15, currentY + 5);

  // Right: Authorised Signatory
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`For ${shopName.toUpperCase()}`, W - 15, currentY - 10, { align: 'right' });
  doc.setLineWidth(0.4);
  doc.line(W - 75, currentY - 5, W - 15, currentY - 5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Authorised Signatory", W - 15, currentY + 5, { align: 'right' });

  // SEAL - MIMIC THE PURPLE STAMP IN THE IMAGE
  const sealX = W - 65;
  const sealY = currentY - 18;
  doc.setDrawColor(120, 50, 150); // Deep Purple
  doc.setLineWidth(0.8);
  doc.circle(sealX, sealY, 14, 'S'); // Outer circle
  doc.setLineWidth(0.3);
  doc.circle(sealX, sealY, 12, 'S'); // Inner circle
  doc.setFontSize(5);
  doc.setTextColor(120, 50, 150);
  doc.text("PAVAN MOBILE WORLD", sealX, sealY - 4, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text("OFFICIAL SEVEN", sealX, sealY + 2, { align: 'center' });
  doc.setFontSize(5);
  doc.text("MIYAPUR, HYD", sealX, sealY + 6, { align: 'center' });

  // Footer text
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text(billFooter, W / 2, H - 15, { align: 'center' });

  // FINAL OUTPUT
  if (download === 'blob') {
    return doc.output('blob');
  } else if (download) {
    const fileName = `Bill_${billNo}_${customerName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  } else {
    return doc.output('bloburl');
  }
};
