import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAvailableSlots } from '../services/api';
import { motion } from 'framer-motion';
import { BASE_URL } from '../services/api';
import { Clock, Mail } from 'lucide-react';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const name = searchParams.get('name');
  const date = searchParams.get('date');
  const occupation = searchParams.get('occupation');


  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState(false);
  const [error, setError] = useState('');
  

  useEffect(() => {
    if (!name ||!date || !occupation) return;

    getAvailableSlots(date, occupation, name)
      .then((data) => {
        const person = data?.available_people?.[0];
        setSlots(person?.available_slots || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [name, date, occupation ]);


  const handleContinue = async () => {
    setError('');
  
    if (!email || !selectedSlot) {
      setError('Please select a slot and enter your email.');
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
  
    try {
      const res = await fetch(`${BASE_URL}/api/slots/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_name: name,
          date,
          time_slot: selectedSlot,
          user_email: email,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok || !data.booking_id) {
        setError(data.error || 'Booking failed. Please try again.');
        return;
      }
  
      // Booking succeeded — navigate to payment with booking_id
      navigate(
        `/payment?booking_id=${data.booking_id}&name=${encodeURIComponent(
          name
        )}&date=${encodeURIComponent(date)}&slot=${encodeURIComponent(selectedSlot)}`
      );
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative bg-gray-50 dark:bg-gray-900 py-10">
      {/* Background blur circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              Select a Time Slot
            </h2>
            <h3 className="mt-2 text-gray-300">{name} on {date}</h3>
          </motion.div>

          {/* Email input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl max-w-md mx-auto">
              <Mail className="text-blue-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                    setEmailValid(false);
                  } else {
                    setEmailValid(true);
                  }
                }}
                className={`bg-transparent text-white placeholder-gray-300 w-full outline-none ${email && !emailValid ? 'border-red-400 border-b' : ''}`}
              />
            </div>
          </motion.div>
          {email && !emailValid && (
            <p className="text-red-400 text-sm text-center mb-4">Please enter a valid email address</p>
          )}


          {loading ? (
            <p className="text-center text-white">Loading slots...</p>
          ) : slots.length === 0 ? (
            <p className="text-center text-red-400">No available slots</p>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-center"
              >
                {slots.map((slot, i) => (
                  <motion.div
                    key={i}
                    variants={cardVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSlot(slot)}
                    className={`cursor-pointer text-center p-4 rounded-xl border backdrop-blur-md transition-all duration-200 ${
                      selectedSlot === slot
                        ? 'bg-blue-500/40 border-blue-300 text-white'
                        : 'bg-white/10 border-white/20 text-white hover:border-white/40'
                    }`}
                  >
                    <Clock className="mx-auto mb-2 text-blue-300" />
                    <span className="font-medium">{slot}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Continue Button */}
              {selectedSlot && email && emailValid && (
                <div className="text-center mt-10">
                  <button
                    onClick={handleContinue}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition duration-300"
                  >
                    Continue
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Booking;
