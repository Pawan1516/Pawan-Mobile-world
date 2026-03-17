import { generateBillPDF } from './pdfGenerator';

export const buildWhatsAppMessage = (billData, settings) => {
  const { 
    billNo = 'N/A', customerName = 'Customer', date = new Date(), paymentMode = 'Cash', items = [], 
    customItems = [], discount = 0, total = 0, notes = '' 
  } = billData || {};
  const { shopName = 'Pavan Mobile World', phone = '7337573732', address = 'Madhavapuri Hills, Miyapur, Hyd', billFooter = 'Thank You For Your Purchase!' } = settings || {};

  let msg = `*${shopName.toUpperCase()}*\n`;
  msg += `📍 ${address}\n`;
  msg += `📞 ${phone}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📄 *Invoice:* #${billNo}\n`;
  msg += `📅 *Date:* ${new Date(date).toLocaleDateString()}\n`;
  msg += `👤 *Customer:* ${customerName}\n`;
  msg += `💳 *Payment:* ${paymentMode}\n`;
  if (notes) msg += `📝 *Notes:* ${notes}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━\n`;
  msg += `*ITEMS ORDERED:*\n`;
  
  items.forEach(item => {
    msg += `◽ *${item.name}*\n`;
    if (item.imei) msg += `   _ID: ${item.imei}_\n`;
    msg += `   (x${item.qty}) - ₹${item.total.toLocaleString()}\n`;
  });
  
  customItems.forEach(item => {
    msg += `◽ *${item.name}*\n`;
    if (item.imei) msg += `   _ID: ${item.imei}_\n`;
    msg += `   (x${item.qty}) - ₹${item.total.toLocaleString()}\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━\n`;
  if (discount > 0) msg += `🔻 *Discount:* -₹${discount.toLocaleString()}\n`;
  msg += `💰 *TOTAL AMOUNT: ₹${total.toLocaleString()}*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_${billFooter}_`;
  
  return msg;
};

export const shareBill = async (billData, settings) => {
  try {
    const pdfBlob = generateBillPDF(billData, settings, 'blob');
    const billNo = billData.billNo || 'N/A';
    const customerName = billData.customerName || 'Customer';
    const fileName = `Bill_${billNo}_${customerName.replace(/\s+/g, '_')}.pdf`;
    
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `${settings?.shopName || 'Bill'} - #${billNo}`,
        text: buildWhatsAppMessage(billData, settings),
      });
      return true;
    } else {
      // Fallback: Just trigger download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(pdfBlob);
      link.download = fileName;
      link.click();
      toast.success('PDF Downloaded. You can now share it manually.');
      return false;
    }
  } catch (error) {
    console.error('Error sharing bill:', error);
    return false;
  }
};

export const sendBillOnWhatsApp = async (phone, billData, settings) => {
  const msg = buildWhatsAppMessage(billData, settings);
  const formattedPhone = phone ? phone.replace(/\D/g, '') : '';
  const fullPhone = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;

  // 1. Generate and get the PDF blob
  const pdfBlob = generateBillPDF(billData, settings, 'blob');
  const fileName = `Bill_${billData.billNo || 'N/A'}.pdf`;
  
  // 2. Open WhatsApp chat directly with the text message
  window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  
  // 3. Download the PDF for the user to attach if needed
  const link = document.createElement('a');
  link.href = URL.createObjectURL(pdfBlob);
  link.download = fileName;
  link.click();
};
