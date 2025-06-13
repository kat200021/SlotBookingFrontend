import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPeople, getAvailableSlots } from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllPeople()
      .then((data) => {
        setPeople(data);
        setFilteredPeople(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDateChange = async (selectedDate) => {
    setDate(selectedDate);
    setCheckingAvailability(true);
    const available = [];
    
    for (const person of people) {
      try {
        const res = await getAvailableSlots(person.name, selectedDate);
        if (Array.isArray(res.available_slots) && res.available_slots.length > 0) {
          available.push(person);
        }
      } catch (err) {
        console.error(`Error for ${person.name}:`, err);
      }
    }
    
    setFilteredPeople(available);
    setCheckingAvailability(false);
  };

  const handleCardClick = (personName) => {
    if (!date) return alert('Please select a date first');
    navigate(`/booking?name=${encodeURIComponent(personName)}&date=${date}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative bg-gray-50 dark:bg-gray-900 py-10">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              Book Your Appointment
            </h1>

          </motion.div>

          {/* Date Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 flex justify-center"
          >
            <div className="relative">
              <div className="absolute bg-white/5 backdrop-blur-md inset-0 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Select Date</h3>
                </div>
                <input
                  type="date"
                  className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </motion.div>

          {/* No Results State */}
          {filteredPeople.length === 0 && date && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Not Available</h3>
                <p className="text-gray-400">No one is available for the selected date. Please try a different date.</p>
              </div>
            </motion.div>
          )}

          {/* People Grid */}
          {filteredPeople.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-center"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-screen-xl mx-auto justify-center">
                {filteredPeople.map((person, index) => (
                  <motion.div
                    key={person.id}
                    variants={cardVariants}
                    whileHover={{ 
                      y: -8, 
                      scale: 1.02,
                      transition: { type: 'spring', stiffness: 400, damping: 10 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCardClick(person.name)}
                    className="group cursor-pointer relative"
                  >
                                       
                    {/* Main card */}
                    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 shadow-2xl">

                      {/* Profile section */}
                      <div className="text-center mb-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-200 transition-colors">
                          {person.name}
                        </h3>
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Default state - shows all the people when no date is selected */}
          {!date && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center mt-14"
            >
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 max-w-lg mx-auto mb-8">
                <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Date</h3>
                <p className="text-gray-300">Choose your preferred appointment date to see who are available.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;