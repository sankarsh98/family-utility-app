// Allowed users for testing mode - Add your email addresses here
export const ALLOWED_USERS = [
  'sankarshpallela@gmail.com',
  // Add more allowed email addresses here
];

// App configuration
export const APP_CONFIG = {
  appName: 'Family Utility',
  version: '1.0.0',
  
  // IRCTC Email sender for ticket parsing
  irctcSender: 'ticketadmin@irctc.co.in',
  
  // PNR Status API (using RapidAPI or similar)
  pnrApiUrl: 'https://irctc1.p.rapidapi.com/api/v3/getPNRStatus',
  
  // Default settings
  defaultCurrency: 'INR',
  dateFormat: 'dd-MMM-yyyy',
  timeFormat: 'HH:mm',
};

// Train classes
export const TRAIN_CLASSES = {
  '1A': 'First AC',
  '2A': 'Second AC',
  '3A': 'Third AC',
  'SL': 'Sleeper',
  'CC': 'Chair Car',
  '2S': 'Second Sitting',
  'EC': 'Executive Chair Car',
  'FC': 'First Class',
  '3E': 'Third AC Economy',
};

// Ticket statuses
export const TICKET_STATUSES = {
  CNF: { label: 'Confirmed', color: 'green' },
  WL: { label: 'Waiting List', color: 'yellow' },
  RAC: { label: 'RAC', color: 'orange' },
  CAN: { label: 'Cancelled', color: 'red' },
  GNWL: { label: 'General Waiting List', color: 'yellow' },
  RLWL: { label: 'Remote Location WL', color: 'yellow' },
  PQWL: { label: 'Pooled Quota WL', color: 'yellow' },
};

// Medicine timing options
export const MEDICINE_TIMINGS = [
  { value: 'before_breakfast', label: 'Before Breakfast' },
  { value: 'after_breakfast', label: 'After Breakfast' },
  { value: 'before_lunch', label: 'Before Lunch' },
  { value: 'after_lunch', label: 'After Lunch' },
  { value: 'before_dinner', label: 'Before Dinner' },
  { value: 'after_dinner', label: 'After Dinner' },
  { value: 'bedtime', label: 'Bedtime' },
  { value: 'sos', label: 'As Needed (SOS)' },
];

// Family member colors for visual distinction
export const MEMBER_COLORS = [
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#ec4899', // Pink
];
