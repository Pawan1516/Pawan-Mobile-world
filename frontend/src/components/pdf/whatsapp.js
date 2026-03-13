import { generateBillPDF } from './pdfGenerator';

export const buildWhatsAppMessage = (billData, settings) => {
  const { 
    billNo = 'N/A', customerName = 'Customer', date = new Date(), paymentMode = 'Cash', items = [], 
    customItems = [], discount = 0, total = 0, notes = '' 
  } = billData || {};
  const { shopName = 'Pavan Mobile World', address = 'Shop Address', billFooter = 'Thank You For Your Purchase!' } = settings || {};

  let msg = `*${shopName.toUpperCase()}*\n`;
  msg += `📍 ${address}\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `📄 *INVOICE:* #${billNo}\n`;
  msg += `📅 *DATE:* ${new Date(date).toLocaleDateString()}\n`;
  msg += `👤 *CUSTOMER:* ${customerName}\n`;
  msg += `💳 *PAYMENT:* ${paymentMode}\n`;
  if (notes) msg += `📝 *NOTES:* ${notes}\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `*ITEMS:*\n`;
  
  items.forEach(item => {
    msg += `◽ ${item.name} (x${item.qty}) - ₹${item.total.toFixed(2)}\n`;
  });
  
  customItems.forEach(item => {
    msg += `◽ ${item.name} (x${item.qty}) - ₹${item.total.toFixed(2)}\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  if (discount > 0) msg += `🔻 *Discount:* -₹${discount.toFixed(2)}\n`;
  msg += `✅ *TOTAL AMOUNT: ₹${total.toFixed(2)}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `_${billFooter}_`;
  
  return msg;
};

export const sendBillOnWhatsApp = async (phone, billData, settings) => {
  const msg = buildWhatsAppMessage(billData, settings);
  const formattedPhone = phone ? phone.replace(/\D/g, '') : '';
  const fullPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

  // 1. First, always trigger the PDF download locally for record Keeping
  const pdfBlob = generateBillPDF(billData, settings, 'blob');
  
  // 2. Try to Share the PDF File Directly (Best for Mobile)
  if (navigator.share && navigator.canShare) {
    try {
      const safeBillNo = String(billData?.billNo || 'N/A');
      const safeName = String(billData?.customerName || 'Customer');
      const fileName = `Bill_${safeBillNo}_${safeName.replace(/\s+/g, '_')}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Bill from ${settings?.shopName || 'Pavan Mobile World'}`,
          text: msg,
          files: [file]
        });
        return; // Successfully shared using system dialog
      }
    } catch (err) {
      console.log('Sharing failed', err);
    }
  }

  // 3. Fallback: If sharing files is not supported (e.g. Chrome on Desktop)
  // We trigger the local download and open WhatsApp Web with the text bill
  generateBillPDF(billData, settings, true); // Download trigger
  
  setTimeout(() => {
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  }, 500);
};
