import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllPeople, getAvailableSlots, getOccupations } from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [date, setDate] = useState('');
  const [occupation, setOccupation] = useState('');
  const [occupations, setOccupations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [peopleData, occupationsData] = await Promise.all([
          getAllPeople(),
          getOccupations()
        ]);
        setPeople(peopleData);
        setOccupations(occupationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!date || !occupation) return;

    setCheckingAvailability(true);
    setHasSearched(true);
    
    try {
      const res = await getAvailableSlots(date, occupation);
      setFilteredPeople(res.available_people || []);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      setFilteredPeople([]);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleCardClick = (personName) => {
    if (!date || !occupation) return alert('Please select both date and occupation first');
    navigate(`/booking?name=${encodeURIComponent(personName)}&date=${date}&occupation=${occupation}`);
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

          {/* Search Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 flex justify-center"
          >
            <div className="relative">
              <div className="absolute bg-white/5 backdrop-blur-md inset-0 rounded-2xl blur opacity-20"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Date Selection */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <Calendar className="w-6 h-6 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Select Date</h3>
                    </div>
                    <input
                      type="date"
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Occupation Selection */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <User className="w-6 h-6 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Occupation</h3>
                    </div>
                    <select
                      className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select an occupation</option>
                      {occupations.map((occ) => (
                        <option key={occ} value={occ} className="bg-gray-800">
                          {occ}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  disabled={!date || !occupation || checkingAvailability || loading}
                  className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkingAvailability ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Loading...</h3>
                <p className="text-gray-400">Please wait while we fetch the data.</p>
              </div>
            </motion.div>
          )}

          {/* No Results State */}
          { !loading && !checkingAvailability &&hasSearched && filteredPeople.length === 0 && date && occupation && (
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
                <p className="text-gray-400">No one is available for the selected date and occupation. Please try different options.</p>
              </div>
            </motion.div>
          )}

          {/* People Grid */}
          {!loading && filteredPeople.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-center"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-screen-xl mx-auto justify-center">
                {filteredPeople.map((person) => (
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
                        <p className="text-sm text-gray-300">
                          Available Slots: {person.available_slots.length}
                        </p>
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Default state - shows when no search is performed */}
          {!loading && !date && !occupation && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="text-center mt-14"
            >
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 max-w-lg mx-auto mb-8">
                <Calendar className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select Date and Occupation</h3>
                <p className="text-gray-300">Choose your preferred appointment date and occupation to see available slots.</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;