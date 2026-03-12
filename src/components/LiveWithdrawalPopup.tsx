import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Smartphone, Banknote } from 'lucide-react';

interface WithdrawalNotification {
  id: string;
  name: string;
  amount: number;
  phoneNumber: string;
  timeAgo: string;
  location: string;
}

// Kenyan names for authenticity
const kenyanNames = [
  'James Mwangi', 'Grace Wanjiku', 'Peter Ochieng', 'Mary Akinyi',
  'John Kamau', 'Esther Njeri', 'David Otieno', 'Linda Achieng',
  'Michael Kipchirchir', 'Sarah Chebet', 'Daniel Mutua', 'Joyce Wambui',
  'Joseph Maina', 'Ann Muthoni', 'Samuel Kiprotich', 'Lucy Wangari',
  'Paul Kiptoo', 'Faith Jeruto', 'George Omondi', 'Rose Kimani',
  'Kevin Langat', 'Diana Jepchirchir', 'Simon Mbugua', 'Catherine Waithera',
  'Patrick Njoroge', 'Mercyline Atieno', 'Francis Kiprono', 'Janet Chepkoech'
];

// Locations across Kenya
const locations = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika',
  'Malindi', 'Kitale', 'Naivasha', 'Kakamega', 'Meru', 'Nyeri',
  'Machakos', 'Kericho', 'Bungoma', 'Embu', 'Nanyuki', 'Garissa'
];

// Generate a random Kenyan phone number
const generatePhoneNumber = () => {
  const prefixes = ['07', '01'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomDigits = Math.floor(Math.random() * 90000000 + 10000000).toString();
  return `${prefix}${randomDigits.slice(0, 8)}`;
};

// Generate random amount between 500 and 15000
const generateAmount = () => {
  const amounts = [500, 800, 1000, 1500, 2000, 2500, 3000, 5000, 8000, 10000, 15000];
  return amounts[Math.floor(Math.random() * amounts.length)];
};

// Generate random time ago
const generateTimeAgo = () => {
  const times = ['Just now', '1 min ago', '2 mins ago', '3 mins ago', '5 mins ago', '10 mins ago'];
  return times[Math.floor(Math.random() * times.length)];
};

// Generate a single notification
const generateNotification = (): WithdrawalNotification => {
  const name = kenyanNames[Math.floor(Math.random() * kenyanNames.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const phoneNumber = generatePhoneNumber();
  const amount = generateAmount();
  const timeAgo = generateTimeAgo();
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    amount,
    phoneNumber: phoneNumber.replace(/(\d{4})(\d{4})$/, '****$2'),
    timeAgo,
    location,
  };
};

export const LiveWithdrawalPopup = () => {
  const [notifications, setNotifications] = useState<WithdrawalNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<WithdrawalNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Show a new notification
  const showNotification = useCallback(() => {
    const notification = generateNotification();
    setCurrentNotification(notification);
    setIsVisible(true);
    
    // Hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  }, []);

  // Start the notification cycle
  useEffect(() => {
    // Show first notification after 3 seconds
    const initialTimer = setTimeout(() => {
      showNotification();
    }, 3000);

    // Continue showing notifications every 15-25 seconds
    const interval = setInterval(() => {
      showNotification();
    }, 15000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [showNotification]);

  if (!currentNotification) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="pointer-events-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden max-w-sm">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-white font-semibold text-sm">M-Pesa Payment Sent!</span>
                <div className="ml-auto flex gap-0.5">
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="text-white text-xs"
                  >
                    ●
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                    className="text-white text-xs"
                  >
                    ●
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                    className="text-white text-xs"
                  >
                    ●
                  </motion.span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                      {currentNotification.name.charAt(0)}
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <Smartphone className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {currentNotification.name}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      {currentNotification.location}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {currentNotification.phoneNumber}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                      className="flex items-center gap-1 text-green-600"
                    >
                      <Banknote className="w-5 h-5" />
                      <span className="font-bold text-lg">
                        KSh {currentNotification.amount.toLocaleString()}
                      </span>
                    </motion.div>
                    <p className="text-xs text-gray-400 mt-1">
                      {currentNotification.timeAgo}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  />
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-400 text-center mt-2">
                  ✓ Confirmed - M-Pesa transaction completed
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveWithdrawalPopup;
