import { generateBillPDF } from './pdfGenerator';

export const buildWhatsAppMessage = (billData, settings) => {
  const { 
    billNo = 'N/A', customerName = 'Customer', date = new Date(), paymentMode = 'Cash', items = [], 
    customItems = [], discount = 0, gstPercent = 0, gstAmount = 0, total = 0, notes = '' 
  } = billData || {};
  const { shopName = 'Pavan Mobile World', address = 'Shop Address', billFooter = 'Thank You For Your Purchase!' } = settings || {};

  let msg = `*${shopName}*\n${address}\n`;
  msg += `━━━━━━━━━━━━━━━━\n`;
  msg += `*Bill No:* ${billNo}\n`;
  msg += `*Date:* ${new Date(date).toLocaleDateString()}\n`;
  msg += `*Customer:* ${customerName}\n`;
  msg += `*Payment:* ${paymentMode}\n`;
  if (notes) msg += `*Note:* ${notes}\n`;
  msg += `━━━━━━━━━━━━━━━━\n*ITEMS:*\n`;
  
  items.forEach(item => {
    msg += `• ${item.name} × ${item.qty} = ₹${item.total.toFixed(2)}\n`;
  });
  
  customItems.forEach(item => {
    msg += `• ${item.name} × ${item.qty} = ₹${item.total.toFixed(2)}\n`;
  });

  msg += `━━━━━━━━━━━━━━━━\n`;
  if (discount > 0) msg += `Discount: -₹${discount.toFixed(2)}\n`;
  if (gstPercent > 0) msg += `GST (${gstPercent}%): +₹${gstAmount.toFixed(2)}\n`;
  msg += `*💰 TOTAL: ₹${total.toFixed(2)}*\n`;
  msg += `━━━━━━━━━━━━━━━━\n_${billFooter}_`;
  
  return msg;
};

export const sendBillOnWhatsApp = async (phone, billData, settings) => {
  const msg = buildWhatsAppMessage(billData, settings);
  const formattedPhone = phone ? phone.replace(/\D/g, '') : '';
  const fullPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;
  // Fallback to purely text-based wa.me link + PDF download
  generateBillPDF(billData, settings, true);
  
  window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
};
