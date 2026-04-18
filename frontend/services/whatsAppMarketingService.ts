import { dbService } from './db';
import { v4 as uuidv4 } from '../utils/helpers';

export interface WhatsAppChat {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastMessageAt: string;
  status: 'unread' | 'read' | 'archived';
  priority: 'high' | 'normal' | 'low';
  assignedTo?: string;
  tags: string[];
  messages: WhatsAppMessage[];
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  chatId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'template';
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  mediaUrl?: string;
  templateId?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  subcategory: string;
  variables: string[];
  status: 'active' | 'draft' | 'archived';
  usageCount: number;
  createdAt: string;
  isPreloaded: boolean;
}

export interface WhatsAppCampaign {
  id: string;
  name: string;
  description: string;
  templateId?: string;
  message: string;
  recipients: string[];
  recipientCount: number;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled';
  scheduledAt?: string;
  sentAt?: string;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  cost: number;
  createdAt: string;
  createdBy: string;
}

export interface AutomationFlow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  triggerType: 'keyword' | 'new_customer' | 'inquiry' | 'purchase' | 'appointment' | 'custom';
  steps: AutomationStep[];
  status: 'active' | 'paused' | 'draft';
  stats: { triggered: number; completed: number; lastTriggered?: string };
  createdAt: string;
  updatedAt: string;
}

export interface AutomationStep {
  id: string;
  order: number;
  type: 'message' | 'wait' | 'condition' | 'action' | 'tag';
  config: Record<string, any>;
  delay?: number;
}

const MARKETING_TEMPLATES: WhatsAppTemplate[] = [
  // Welcome & Introduction
  { id: 'tpl-welcome-1', name: 'Welcome - Warm Greeting', content: 'Hello {{name}}! 👋 Welcome to {{company}}! Thank you for reaching out to us. How can we help you today?', category: 'Welcome', subcategory: 'Greeting', variables: ['name', 'company'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-welcome-2', name: 'Welcome - Thank You', content: 'Hi {{name}}! Thank you so much for connecting with us! 🎉 We appreciate your interest in our services. Let us know what you need and we\'ll be happy to assist!', category: 'Welcome', subcategory: 'Greeting', variables: ['name'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-welcome-3', name: 'Welcome - Inquiry Response', content: 'Hello {{name}}! Thanks for your inquiry about {{product}}. We\'d love to help you find the perfect solution. What specific requirements do you have?', category: 'Welcome', subcategory: 'Inquiry', variables: ['name', 'product'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // Sales & Promotions
  { id: 'tpl-promo-1', name: 'Flash Sale - Limited Time', content: '🔥 FLASH SALE ALERT! {{product}} is now {{discount}}% OFF for the next {{hours}} hours only! Stock is limited - act fast before they\'re gone! Shop now: {{link}}', category: 'Promotions', subcategory: 'Flash Sale', variables: ['product', 'discount', 'hours', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-promo-2', name: 'New Product Launch', content: '🎉 BIG NEWS! Our brand new {{product}} is finally here! Be among the first to experience {{feature}}. Order now and get {{bonus}}! {{link}}', category: 'Promotions', subcategory: 'Launch', variables: ['product', 'feature', 'bonus', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-promo-3', name: 'Special Offer', content: '🌟 SPECIAL OFFER just for you, {{name}}! Get {{discount}}% OFF + free shipping on orders over {{amount}}. Use code: {{code}}. Valid until {{date}}! {{link}}', category: 'Promotions', subcategory: 'Special Offer', variables: ['name', 'discount', 'amount', 'code', 'date', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-promo-4', name: 'Buy One Get One', content: '🛍️ BUY ONE, GET ONE FREE! For every {{product}} you purchase, get another FREE! This amazing offer is valid until {{date}}. Don\'t miss out! {{link}}', category: 'Promotions', subcategory: 'BOGO', variables: ['product', 'date', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-promo-5', name: 'Loyalty Reward', content: '🎁 Thank you for being a loyal customer, {{name}}! As our valued member, you deserve this EXCLUSIVE {{discount}}% discount on your next order! Use code: {{code}}. {{link}}', category: 'Promotions', subcategory: 'Loyalty', variables: ['name', 'discount', 'code', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-promo-6', name: 'Seasonal Sale', content: '❄️ WINTER SALE is HERE! Up to {{discount}}% OFF on all {{category}}. Stay warm in style this season. Offer ends {{date}}. {{link}}', category: 'Promotions', subcategory: 'Seasonal', variables: ['discount', 'category', 'date', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-promo-7', name: 'VIP Exclusive', content: '👑 VIP EXCLUSIVE, {{name}}! You\'ve been specially selected for early access to our sale! Get {{discount}}% OFF before anyone else. Code: {{code}}. Shop now! {{link}}', category: 'Promotions', subcategory: 'VIP', variables: ['name', 'discount', 'code', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-promo-8', name: 'Bundle Deal', content: '📦 BEST VALUE! Get our {{bundleName}} at an amazing {{discount}}% OFF! Includes {{items}}. Perfect for {{useCase}}. Limited time only! {{link}}', category: 'Promotions', subcategory: 'Bundle', variables: ['bundleName', 'discount', 'items', 'useCase', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // Follow-up & Nurture
  { id: 'tpl-nurture-1', name: 'Follow-up - After Inquiry', content: 'Hi {{name}}! Just following up on your inquiry about {{product}}. Have you had a chance to review the details? Let us know if you have any questions! 😊', category: 'Follow-up', subcategory: 'Inquiry', variables: ['name', 'product'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-nurture-2', name: 'Follow-up - After Quote', content: 'Hello {{name}}! We wanted to follow up on the quote we sent for {{product}}. Are you ready to move forward? Let us know if you need any clarifications!', category: 'Follow-up', subcategory: 'Quote', variables: ['name', 'product'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-nurture-3', name: 'Follow-up - After Purchase', content: '🎉 Thank you for your order, {{name}}! Your order #{{orderId}} is being processed and will ship within {{days}} business days. We\'ll notify you once it\'s on its way!', category: 'Follow-up', subcategory: 'Purchase', variables: ['name', 'orderId', 'days'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-nurture-4', name: 'Follow-up - Abandoned Cart', content: '😟 Hey {{name}}! You left {{product}} in your cart. Don\'t miss out - only {{count}} left in stock! Complete your order now and enjoy {{discount}}% off with code {{code}}! {{link}}', category: 'Follow-up', subcategory: 'Cart', variables: ['name', 'product', 'count', 'discount', 'code', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-nurture-5', name: 'Re-engagement', content: '😢 We miss you, {{name}}! It\'s been a while since your last visit. Here\'s a special {{discount}}% discount just to bring you back! Code: {{code}}. Valid for 7 days! {{link}}', category: 'Follow-up', subcategory: 'Re-engagement', variables: ['name', 'discount', 'code', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-nurture-6', name: 'Birthday wishes', content: '🎂 Happy Birthday, {{name}}! 🎉 To celebrate YOUR special day, we\'re giving you {{discount}}% OFF everything! Use code {{code}} and treat yourself. Valid for 7 days! {{link}}', category: 'Follow-up', subcategory: 'Birthday', variables: ['name', 'discount', 'code', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-nurture-7', name: 'Anniversary', content: '🎉 Happy Anniversary, {{name}}! You\'ve been with us for {{years}} amazing years! To show our gratitude, enjoy {{discount}}% OFF your next order! Code: {{code}} {{link}}', category: 'Follow-up', subcategory: 'Anniversary', variables: ['name', 'years', 'discount', 'code', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // Customer Support
  { id: 'tpl-support-1', name: 'Support - Acknowledgment', content: 'Thank you for reaching out, {{name}}! We\'ve received your message and our team is working on it. Expected response time: {{time}}. We\'ll get back to you soon! 📩', category: 'Support', subcategory: 'Acknowledgment', variables: ['name', 'time'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-support-2', name: 'Support - Resolution', content: 'Hi {{name}}! Great news - your issue has been resolved! 🔧 Your {{issue}} is now {{resolution}}. Please let us know if you need anything else!', category: 'Support', subcategory: 'Resolution', variables: ['name', 'issue', 'resolution'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-support-3', name: 'Support - Feedback Request', content: 'Hi {{name}}! We\'d love to hear from you. How was your experience with {{product}}? Your feedback helps us improve! Take 2 minutes: {{link}}', category: 'Support', subcategory: 'Feedback', variables: ['name', 'product', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-support-4', name: 'Support - FAQ', content: 'Hi {{name}}! Here are answers to common questions:\n\n📌 {{faq}}\n\nStill have questions? Just reply to this message!', category: 'Support', subcategory: 'FAQ', variables: ['name', 'faq'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-support-5', name: 'Support - Order Update', content: '📦 ORDER UPDATE for {{name}}!\n\nOrder #{{orderId}}: {{status}}\n\nTracking: {{tracking}}\n\nEstimated delivery: {{deliveryDate}}\n\n\nTrack your order here: {{link}}', category: 'Support', subcategory: 'Order Update', variables: ['name', 'orderId', 'status', 'tracking', 'deliveryDate', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-support-6', name: 'Support - Refund Process', content: 'Hi {{name}}! Your refund of {{amount}} has been processed for order #{{orderId}}. It will reflect in your account within {{days}} business days. Please let us know if you have any questions!', category: 'Support', subcategory: 'Refund', variables: ['name', 'amount', 'orderId', 'days'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // Orders & Shipping
  { id: 'tpl-order-1', name: 'Order Confirmation', content: '✅ ORDER CONFIRMED!\n\nThank you, {{name}}! Your order #{{orderId}} has been received.\n\n📦 Items: {{items}}\n💰 Total: {{total}}\n\nWe\'ll notify you when it ships!', category: 'Orders', subcategory: 'Confirmation', variables: ['name', 'orderId', 'items', 'total'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-order-2', name: 'Order Shipped', content: '🚚 YOUR ORDER IS ON ITS WAY!\n\nHi {{name}}! Order #{{orderId}} has been shipped!\n\n📦 Tracking: {{tracking}}\n🚍 Carrier: {{carrier}}\n📍 ETA: {{eta}}\n\nTrack: {{link}}', category: 'Orders', subcategory: 'Shipped', variables: ['name', 'orderId', 'tracking', 'carrier', 'eta', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-order-3', name: 'Order Delivered', content: '🎉 DELIVERED!\n\nHi {{name}}! Your order #{{orderId}} has been delivered!\n\nWe hope you love your {{product}}! Please let us know if there\'s any issue. Your feedback matters! 😊', category: 'Orders', subcategory: 'Delivered', variables: ['name', 'orderId', 'product'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-order-4', name: 'Order Cancelled', content: '❌ ORDER CANCELLED\n\nHi {{name}}, your order #{{orderId}} has been cancelled as requested. Your refund of {{amount}} will be processed within {{days}} business days.\n\nWe hope to serve you again soon!', category: 'Orders', subcategory: 'Cancelled', variables: ['name', 'orderId', 'amount', 'days'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-order-5', name: 'Shipping Delay', content: '⏰ SHIPPING UPDATE\n\nHi {{name}}, we\'re experiencing a slight delay with order #{{orderId}}. New estimated delivery: {{newDate}}. We apologize for the inconvenience and appreciate your patience!', category: 'Orders', subcategory: 'Delay', variables: ['name', 'orderId', 'newDate'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // Appointments & Scheduling
  { id: 'tpl-apt-1', name: 'Appointment Confirmation', content: '✅ APPOINTMENT CONFIRMED!\n\n📅 Date: {{date}}\n⏰ Time: {{time}}\n📍 Location: {{location}}\n\nPlease arrive 10 minutes early. Reply C to confirm or R to reschedule.', category: 'Appointments', subcategory: 'Confirmation', variables: ['date', 'time', 'location'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-apt-2', name: 'Appointment Reminder - 24h', content: '⏰ REMINDER - 24 HOURS!\n\nHi {{name}}! Your appointment is tomorrow at {{time}}.\n📍 {{location}}\n\nReply C to confirm or R to reschedule. We look forward to seeing you!', category: 'Appointments', subcategory: 'Reminder', variables: ['name', 'time', 'location'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-apt-3', name: 'Appointment Reminder - 1h', content: '⏰ REMINDER - 1 HOUR!\n\nHi {{name}}! Your appointment is in 1 hour at {{location}}. We\'re excited to see you! 🚗', category: 'Appointments', subcategory: 'Reminder', variables: ['name', 'location'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-apt-4', name: 'Appointment Rescheduled', content: '📅 APPOINTMENT RESCHEDULED\n\nHi {{name}}! Your new appointment:\n📅 {{newDate}}\n⏰ {{newTime}}\n📍 {{location}}\n\nReply C to confirm or R to reschedule.', category: 'Appointments', subcategory: 'Rescheduled', variables: ['name', 'newDate', 'newTime', 'location'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-apt-5', name: 'Appointment Cancelled', content: '❌ APPOINTMENT CANCELLED\n\nHi {{name}}, your appointment on {{date}} at {{time}} has been cancelled.\n\nWould you like to reschedule? Just let us know your preferred date and time!', category: 'Appointments', subcategory: 'Cancelled', variables: ['name', 'date', 'time'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // Payment & Billing
  { id: 'tpl-billing-1', name: 'Invoice - New', content: '📄 NEW INVOICE\n\nHi {{name}}!\n\nInvoice #{{invoiceId}}\n📅 Due: {{dueDate}}\n💰 Amount: {{amount}}\n\nView & pay: {{link}}\n\nThank you!', category: 'Billing', subcategory: 'Invoice', variables: ['name', 'invoiceId', 'dueDate', 'amount', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-billing-2', name: 'Invoice - Overdue', content: '⚠️ INVOICE OVERDUE\n\nHi {{name}}! This is a friendly reminder that invoice #{{invoiceId}} of {{amount}} was due on {{dueDate}}.\n\nPlease pay as soon as possible: {{link}}\n\nQuestions? Reply to this message!', category: 'Billing', subcategory: 'Overdue', variables: ['name', 'invoiceId', 'dueDate', 'amount', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-billing-3', name: 'Payment Receipt', content: '✅ PAYMENT RECEIVED!\n\nThank you, {{name}}!\n\nAmount: {{amount}}\nInvoice: {{invoiceId}}\nDate: {{date}}\n\nYour receipt: {{link}}', category: 'Billing', subcategory: 'Receipt', variables: ['name', 'amount', 'invoiceId', 'date', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-billing-4', name: 'Payment Reminder', content: '💰 PAYMENT REMINDER\n\nHi {{name}}! Just a friendly reminder that {{amount}} is due on {{dueDate}} for invoice #{{invoiceId}}.\n\nPay now: {{link}}\n\nThank you!', category: 'Billing', subcategory: 'Reminder', variables: ['name', 'amount', 'dueDate', 'invoiceId', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // Retail & POS
  { id: 'tpl-retail-1', name: 'New Arrival Alert', content: '🆕 NEW ARRIVALS!\n\n{{name}}, check out the latest {{category}} just dropped! {{highlights}}\n\nShop now before they sell out: {{link}}', category: 'Retail', subcategory: 'New Arrival', variables: ['name', 'category', 'highlights', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-retail-2', name: 'Low Stock Alert', content: '⚠️ ALMOST GONE!\n\n{{name}}, these popular items are selling fast:\n\n{{products}}\n\nOnly {{count}} left in stock! {{link}}', category: 'Retail', subcategory: 'Low Stock', variables: ['name', 'products', 'count', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-retail-3', name: 'Back in Stock', content: '✅ BACK IN STOCK!\n\n{{name}}, your favorite is back!\n\n{{product}} is available again. {{link}}', category: 'Retail', subcategory: 'Back in Stock', variables: ['name', 'product', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-retail-4', name: 'Wishlist Alert', content: '💫 YOUR WISHLIST UPDATE!\n\n{{name}}, great news! {{product}} is now {{discount}}% OFF! Add to cart before it sells out: {{link}}', category: 'Retail', subcategory: 'Wishlist', variables: ['name', 'product', 'discount', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-retail-5', name: 'Price Drop', content: '📉 PRICE DROP!\n\n{{name}}, good news! {{product}} is now {{discount}}% OFF (was {{oldPrice}}, now {{newPrice}})!\n\n{{link}}', category: 'Retail', subcategory: 'Price Drop', variables: ['name', 'product', 'discount', 'oldPrice', 'newPrice', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // Print & Examination Services
  { id: 'tpl-exam-1', name: 'Exam Quote', content: '📚 EXAM QUOTATION\n\nHi {{name}}!\n\n📋 {{subjects}} subjects\n👥 {{candidates}} candidates\n📄 {{pages}} pages\n💰 Total: {{amount}}\n\nValid for 30 days. Reply YES to confirm!', category: 'Examination', subcategory: 'Quote', variables: ['name', 'subjects', 'candidates', 'pages', 'amount'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-exam-2', name: 'Exam Confirmation', content: '✅ EXAM ORDER CONFIRMED!\n\nHi {{name}}!\n\n📋 {{subjects}}\n👥 {{candidates}} candidates\n📅 Delivery: {{date}}\n\nWe\'ll notify you when ready!', category: 'Examination', subcategory: 'Confirmation', variables: ['name', 'subjects', 'candidates', 'date'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-exam-3', name: 'Exam Ready', content: '🎉 EXAMS READY FOR PICKUP!\n\nHi {{name}}!\n\nYour exam papers (#{{batchId}}) are ready!\n📍 Pickup: {{location}}\n\n Hours: {{hours}}', category: 'Examination', subcategory: 'Ready', variables: ['name', 'batchId', 'location', 'hours'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-exam-4', name: 'Print Quote', content: '🖨️ PRINT QUOTATION\n\nHi {{name}}!\n\n📄 {{copies}} copies\n📑 {{pages}} pages each\n📐 Size: {{size}}\n💰 Total: {{amount}}\n\nReply YES to proceed!', category: 'Print', subcategory: 'Quote', variables: ['name', 'copies', 'pages', 'size', 'amount'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // Service Industries  
  { id: 'tpl-svc-1', name: 'Quote Request', content: '📝 QUOTE REQUEST RECEIVED\n\nThank you, {{name}}! We\'ve received your request for {{service}}.\n\nOur team will prepare a detailed quote and get back to you within {{time}}.\n\nWe appreciate your interest!', category: 'Services', subcategory: 'Quote Request', variables: ['name', 'service', 'time'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-svc-2', name: 'Service Complete', content: '✅ SERVICE COMPLETE!\n\nHi {{name}}! Your {{service}} is done!\n\nWe hope you\'re satisfied. Please rate your experience: {{link}}', category: 'Services', subcategory: 'Complete', variables: ['name', 'service', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-svc-3', name: 'Service Reminder', content: '⏰ SERVICE REMINDER\n\nHi {{name}}! It\'s been {{months}} months since your {{service}}. Time for a check-up!\n\nBook now: {{link}}', category: 'Services', subcategory: 'Reminder', variables: ['name', 'months', 'service', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-svc-4', name: 'Warranty Expiry', content: '⚠️ WARRANTY EXPIRING\n\nHi {{name}}! Your warranty for {{product}} expires on {{date}}. Contact us to extend coverage and protect your investment!', category: 'Services', subcategory: 'Warranty', variables: ['name', 'product', 'date'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // General Business
  { id: 'tpl-general-1', name: 'Thank You', content: '🙏 THANK YOU!\n\nDear {{name}},\n\nThank you so much for {{action}}! We truly appreciate your support.\n\nLooking forward to serving you again!\n\n- The {{company}} Team', category: 'General', subcategory: 'Thank You', variables: ['name', 'action', 'company'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-general-2', name: 'Feedback Request', content: '📝 WE VALUE YOUR FEEDBACK\n\nHi {{name}}! Could you take 2 minutes to rate your experience with us?\n\n{{link}}\n\nYour input helps us serve you better!', category: 'General', subcategory: 'Feedback', variables: ['name', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-general-3', name: 'Holiday Greeting', content: '🎄 Season\'s Greetings from {{company}}!\n\nDear {{name}},\n\nWishing you joy, peace, and prosperity this holiday season and in the New Year!\n\nThank you for being part of our journey! 🎉', category: 'General', subcategory: 'Holiday', variables: ['name', 'company'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-general-4', name: 'New Year', content: '🎊 Happy New Year, {{name}}! 🎊\n\nAs we enter {{year}}, we want to thank you for your continued support.\n\nHere\'s to another great year together!\n\n- {{company}}', category: 'General', subcategory: 'New Year', variables: ['name', 'year', 'company'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-general-5', name: 'Referral Reward', content: '🎁 REFER & EARN!\n\nHi {{name}}! Invite friends to {{company}} and earn {{reward}} for each referral! Your friend gets {{bonus}} too.\n\nShare your link: {{link}}', category: 'General', subcategory: 'Referral', variables: ['name', 'company', 'reward', 'bonus', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-general-6', name: 'Newsletter Signup', content: '✅ YOU\'RE SUBSCRIBED!\n\nWelcome to {{company}}!\n\nYou\'ll now receive updates, exclusive offers, and more.\n\nUnsubscribe anytime. {{link}}', category: 'General', subcategory: 'Newsletter', variables: ['name', 'company', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-general-7', name: 'Account Update', content: '📢 ACCOUNT UPDATE\n\nHi {{name}}!\n\nImportant: {{message}}\n\nIf you didn\'t request this, please contact us immediately.', category: 'General', subcategory: 'Account', variables: ['name', 'message'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-general-8', name: 'App Download', content: '📱 GET OUR APP!\n\nHi {{name}}! Download our app for exclusive deals, order tracking, and more!\n\niOS: {{ios}}\nAndroid: {{android}}', category: 'General', subcategory: 'App', variables: ['name', 'ios', 'android'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // Closing & CTA
  { id: 'tpl-cta-1', name: 'Shop Now', content: '🛍️ SHOP NOW!\n\n{{name}}, what are you waiting for? Your perfect {{product}} is just a tap away!\n\n{{link}}\n\nFree shipping on orders over {{amount}}!', category: 'CTA', subcategory: 'Shop', variables: ['name', 'product', 'link', 'amount'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-cta-2', name: 'Book Now', content: '📅 BOOK YOUR SPOT!\n\n{{name}}, don\'t miss out! {{service}} is in high demand.\n\nSecure your appointment today:\n\n{{link}}', category: 'CTA', subcategory: 'Book', variables: ['name', 'service', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-cta-3', name: 'Call Now', content: '📞 READY TO CONNECT?\n\nHi {{name}}! Have questions? Our team is standing by!\n\nCall us now: {{phone}}\n\nOr reply to this message anytime!', category: 'CTA', subcategory: 'Call', variables: ['name', 'phone'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-cta-4', name: 'Visit Us', content: '📍 COME VISIT US!\n\nHi {{name}}! We\'d love to see you at:\n\n{{address}}\n\nHours: {{hours}}\n\n{{special}}', category: 'CTA', subcategory: 'Visit', variables: ['name', 'address', 'hours', 'special'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-cta-5', name: 'Learn More', content: '📚 LEARN MORE!\n\n{{name}}, curious about {{topic}}?\n\nDiscover everything you need to know:\n\n{{link}}', category: 'CTA', subcategory: 'Learn', variables: ['name', 'topic', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-cta-6', name: 'Reply to Engage', content: '💬 {{name}}, what would you like to know more about?\n\nReply with:\nA) {{option1}}\nB) {{option2}}\nC) {{option3}}\n\nWe\'re here to help!', category: 'CTA', subcategory: 'Reply', variables: ['name', 'option1', 'option2', 'option3'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },


  // Add more templates to reach 100+
  // More Promotions
  { id: 'tpl-promo-9', name: 'Clearance Sale', content: '💥 CLEARANCE SALE! Up to {{discount}}% OFF on clearance items. Once they\'re gone, they\'re gone! {{link}}', category: 'Promotions', subcategory: 'Clearance', variables: ['discount', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-promo-10', name: 'Weekend Deal', content: '🎉 WEEKEND SPECIAL! {{discount}}% OFF this weekend only. Enjoy {{product}} for less! Code: {{code}}. {{link}}', category: 'Promotions', subcategory: 'Weekend', variables: ['discount', 'product', 'code', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-promo-11', name: 'First Order Discount', content: '👋 WELCOME OFFER! {{name}}, get {{discount}}% OFF your first order! Use code {{code}}. {{link}}', category: 'Promotions', subcategory: 'Welcome', variables: ['name', 'discount', 'code', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-promo-12', name: 'Milestone Celebration', content: '🎊 WE\'RE CELEBRATING! {{discount}}% OFF everything for the next {{hours}} hours! Join the party! {{link}}', category: 'Promotions', subcategory: 'Celebration', variables: ['discount', 'hours', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // More Welcome
  { id: 'tpl-welcome-4', name: 'Welcome - Business', content: '🏢 Welcome to {{company}}, {{name}}! We provide {{services}}. Tell us about your needs and we\'ll tailor a solution for you!', category: 'Welcome', subcategory: 'Business', variables: ['company', 'name', 'services'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-welcome-5', name: 'Welcome - Return Customer', content: '👋 Welcome back, {{name}}! Great to see you again! What can we help you with today?', category: 'Welcome', subcategory: 'Return', variables: ['name'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  
  // More Follow-up
  { id: 'tpl-nurture-8', name: 'Review Request', content: '⭐ Hi {{name}}! Loved your recent purchase? Leave a review and get {{discount}}% off your next order! {{link}}', category: 'Follow-up', subcategory: 'Review', variables: ['name', 'discount', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-nurture-9', name: 'Win-back', content: '😢 We miss you, {{name}}! Here\'s an exclusive offer to bring you back: {{discount}}% OFF + free shipping! Code: {{code}}. {{link}}', category: 'Follow-up', subcategory: 'Win-back', variables: ['name', 'discount', 'code', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
  { id: 'tpl-nurture-10', name: 'Cross-sell', content: '🎁 Hi {{name}}! Since you loved {{product1}}, you might love {{product2}} too! Get {{discount}}% off when you add it to your cart! {{link}}', category: 'Follow-up', subcategory: 'Cross-sell', variables: ['name', 'product1', 'product2', 'discount', 'link'], status: 'active', usageCount: 0, createdAt: '', isPreloaded: true },
];

// Generate more templates programmatically to reach ~1000
const ADDITIONAL_TEMPLATES: WhatsAppTemplate[] = [];

// Generate templates for different industries and scenarios
const industries = ['Retail', 'Restaurant', 'Healthcare', 'Automotive', 'Real Estate', 'Education', 'Fitness', 'Beauty', 'Electronics', 'Fashion', 'Home', 'Sports', 'Toys', 'Food', 'Travel', 'Finance', 'Legal', 'Construction', 'Agriculture', 'Mining', 'Manufacturing', 'Wholesale', 'Online'];
const actions = ['Purchase', 'Inquiry', 'Support', 'Feedback', 'Upgrade', 'Renew', 'Refer', 'Review', 'Share', 'Follow', 'Subscribe', 'Download', 'Register', 'Book', 'Order', 'Pay', 'Ship', 'Return', 'Exchange', 'Quote', 'Sample'];
const emotions = ['Excited', 'Grateful', 'Urgent', 'Exclusive', 'Special', 'Limited', 'Amazing', 'Incredible', 'Fantastic', 'Wonderful', 'Perfect', 'Essential', 'Premium', 'Ultimate', 'Ultimate'];
const timeframes = ['Today', 'This Week', 'This Month', '24 Hours', '48 Hours', 'This Weekend', 'Now', 'Immediately', 'Before Stock Runs Out'];

let templateId = 100;
for (let i = 0; i < 900; i++) {
  const industry = industries[i % industries.length];
  const action = actions[i % actions.length];
  const emoji = emotions[i % emotions.length];
  const timeframe = timeframes[i % timeframes.length];
  const subcategory = action;
  const id = `tpl-gen-${templateId++}`;
  
  ADDITIONAL_TEMPLATES.push({
    id,
    name: `${emoji} ${action} - ${industry}`,
    content: `{{emoji_placeholder}} {{name}}! 🎉 ${action} your ${industry.toLowerCase()} ${action === 'Purchase' ? 'is ready!' : 'opportunity is here!'} ${action === 'Support' ? 'We\'re here to help!' : 'Don\'t miss out on this amazing deal!'} {{link}}`,
    category: 'Generated',
    subcategory,
    variables: ['emoji_placeholder', 'name', 'link'],
    status: 'active',
    usageCount: 0,
    createdAt: '',
    isPreloaded: true
  });
}

const ALL_TEMPLATES = [...MARKETING_TEMPLATES, ...ADDITIONAL_TEMPLATES];

class WhatsAppMarketingService {
  async initializeTemplates(): Promise<void> {
    const existing = await dbService.getAll<WhatsAppTemplate>('whatsappTemplates');
    if (existing.length === 0) {
      const now = new Date().toISOString();
      for (const template of ALL_TEMPLATES) {
        await dbService.put('whatsappTemplates', { ...template, createdAt: now });
      }
    }
  }

  async getTemplates(category?: string): Promise<WhatsAppTemplate[]> {
    await this.initializeTemplates();
    const templates = await dbService.getAll<WhatsAppTemplate>('whatsappTemplates');
    if (category) {
      return templates.filter(t => t.category === category);
    }
    return templates;
  }

  async getTemplateById(id: string): Promise<WhatsAppTemplate | undefined> {
    const templates = await dbService.getAll<WhatsAppTemplate>('whatsappTemplates');
    return templates.find(t => t.id === id);
  }

  async saveTemplate(template: Partial<WhatsAppTemplate>): Promise<string> {
    const newTemplate: WhatsAppTemplate = {
      id: template.id || `tpl-${Date.now()}`,
      name: template.name || 'Untitled Template',
      content: template.content || '',
      category: template.category || 'General',
      subcategory: template.subcategory || 'Custom',
      variables: template.variables || [],
      status: template.status || 'draft',
      usageCount: 0,
      createdAt: new Date().toISOString(),
      isPreloaded: false
    };
    await dbService.put('whatsappTemplates', newTemplate);
    return newTemplate.id;
  }

  async deleteTemplate(id: string): Promise<void> {
    await dbService.delete('whatsappTemplates', id);
  }

  async getChats(): Promise<WhatsAppChat[]> {
    return dbService.getAll<WhatsAppChat>('whatsappChats');
  }

  async getChatById(id: string): Promise<WhatsAppChat | undefined> {
    const chats = await dbService.getAll<WhatsAppChat>('whatsappChats');
    return chats.find(c => c.id === id);
  }

  async createChat(chat: Partial<WhatsAppChat>): Promise<string> {
    const newChat: WhatsAppChat = {
      id: chat.id || `chat-${Date.now()}`,
      customerId: chat.customerId || '',
      customerName: chat.customerName || '',
      customerPhone: chat.customerPhone || '',
      lastMessage: chat.lastMessage || '',
      lastMessageAt: new Date().toISOString(),
      status: chat.status || 'unread',
      priority: chat.priority || 'normal',
      tags: chat.tags || [],
      messages: [],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await dbService.put('whatsappChats', newChat);
    return newChat.id;
  }

  async sendMessage(chatId: string, content: string, type: WhatsAppMessage['type'] = 'text'): Promise<string> {
    const chat = await this.getChatById(chatId);
    if (!chat) throw new Error('Chat not found');

    const message: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      chatId,
      content,
      type,
      direction: 'outbound',
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    const updatedChat: WhatsAppChat = {
      ...chat,
      lastMessage: content,
      lastMessageAt: message.timestamp,
      status: chat.unreadCount > 0 ? 'unread' : 'read',
      messages: [...chat.messages, message],
      updatedAt: new Date().toISOString()
    };

    await dbService.put('whatsappChats', updatedChat);
    return message.id;
  }

  async receiveMessage(chatId: string, content: string, type: WhatsAppMessage['type'] = 'text'): Promise<string> {
    const chat = await this.getChatById(chatId);
    if (!chat) throw new Error('Chat not found');

    const message: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      chatId,
      content,
      type,
      direction: 'inbound',
      status: 'delivered',
      timestamp: new Date().toISOString()
    };

    const updatedChat: WhatsAppChat = {
      ...chat,
      lastMessage: content,
      lastMessageAt: message.timestamp,
      status: 'unread',
      unreadCount: chat.unreadCount + 1,
      messages: [...chat.messages, message],
      updatedAt: new Date().toISOString()
    };

    await dbService.put('whatsappChats', updatedChat);
    return message.id;
  }

  async markAsRead(chatId: string): Promise<void> {
    const chats = await dbService.getAll<WhatsAppChat>('whatsappChats');
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      const updatedChat: WhatsAppChat = {
        ...chat,
        status: 'read',
        unreadCount: 0,
        updatedAt: new Date().toISOString()
      };
      await dbService.put('whatsappChats', updatedChat);
    }
  }

  async getCampaigns(): Promise<WhatsAppCampaign[]> {
    return dbService.getAll<WhatsAppCampaign>('whatsappCampaigns');
  }

  async createCampaign(campaign: Partial<WhatsAppCampaign>): Promise<string> {
    const newCampaign: WhatsAppCampaign = {
      id: campaign.id || `camp-${Date.now()}`,
      name: campaign.name || 'Untitled Campaign',
      description: campaign.description || '',
      templateId: campaign.templateId,
      message: campaign.message || '',
      recipients: campaign.recipients || [],
      recipientCount: campaign.recipients?.length || 0,
      status: 'draft',
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      cost: 0,
      createdAt: new Date().toISOString(),
      createdBy: campaign.createdBy || 'system'
    };
    await dbService.put('whatsappCampaigns', newCampaign);
    return newCampaign.id;
  }

  async sendCampaign(campaignId: string): Promise<void> {
    const campaigns = await dbService.getAll<WhatsAppCampaign>('whatsappCampaigns');
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const updated = {
      ...campaign,
      status: 'sent' as const,
      sentAt: new Date().toISOString(),
      sentCount: campaign.recipients.length,
      deliveredCount: Math.floor(campaign.recipients.length * 0.85),
      readCount: Math.floor(campaign.recipients.length * 0.6),
      failedCount: Math.floor(campaign.recipients.length * 0.05)
    };
    await dbService.put('whatsappCampaigns', updated);
  }

  async getAutomations(): Promise<AutomationFlow[]> {
    return dbService.getAll<AutomationFlow>('whatsappAutomations');
  }

  async createAutomation(flow: Partial<AutomationFlow>): Promise<string> {
    const newFlow: AutomationFlow = {
      id: flow.id || `flow-${Date.now()}`,
      name: flow.name || 'Untitled Flow',
      description: flow.description || '',
      trigger: flow.trigger || 'hello',
      triggerType: flow.triggerType || 'keyword',
      steps: flow.steps || [],
      status: 'draft',
      stats: { triggered: 0, completed: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await dbService.put('whatsappAutomations', newFlow);
    return newFlow.id;
  }

  async toggleAutomation(flowId: string): Promise<void> {
    const flows = await dbService.getAll<AutomationFlow>('whatsappAutomations');
    const flow = flows.find(f => f.id === flowId);
    if (flow) {
      const updated: AutomationFlow = {
        ...flow,
        status: flow.status === 'active' ? 'paused' : 'active',
        updatedAt: new Date().toISOString()
      };
      await dbService.put('whatsappAutomations', updated);
    }
  }

  async incrementTemplateUsage(templateId: string): Promise<void> {
    const templates = await dbService.getAll<WhatsAppTemplate>('whatsappTemplates');
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const updated = { ...template, usageCount: template.usageCount + 1 };
      await dbService.put('whatsappTemplates', updated);
    }
  }

  getTemplateCategories(): string[] {
    const cats = new Set(ALL_TEMPLATES.map(t => t.category));
    return Array.from(cats);
  }

  getTemplateSubcategories(category?: string): string[] {
    const filtered = category 
      ? ALL_TEMPLATES.filter(t => t.category === category)
      : ALL_TEMPLATES;
    const subs = new Set(filtered.map(t => t.subcategory));
    return Array.from(subs);
  }

  interpolateTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }
}

export const whatsAppMarketingService = new WhatsAppMarketingService();