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

  // 1. Trigger the PDF download locally for record keeping
  generateBillPDF(billData, settings, true);
  
  // 2. Open WhatsApp chat directly with the Bill Link message
  window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
};
