import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BASE_URL } from '../services/api';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const booking_id = searchParams.get('booking_id');
  const name = searchParams.get('name');
  const date = searchParams.get('date');
  const slot = searchParams.get('slot');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhone = async () => {
      if (!booking_id) return setLoading(false);
      try {
        const res = await fetch(`${BASE_URL}/api/people?name=${encodeURIComponent(name)}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPhone(data[0].phone || 'N/A');
        } else {
          setPhone('N/A');
        }
      } catch {
        setPhone('N/A');
      } finally {
        setLoading(false);
      }
    };
    fetchPhone();
  }, [booking_id, name]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-400">Booking Confirmed</h1>
        <div className="mb-4">
          <div className="text-lg mb-2">Name: <span className="font-semibold text-blue-300">{name}</span></div>
          <div className="text-lg mb-2">Phone: <span className="font-semibold text-blue-300">{loading ? 'Loading...' : phone}</span></div>
          <div className="text-lg mb-2">Date: <span className="font-semibold text-blue-300">{date}</span></div>
          <div className="text-lg mb-2">Time Slot: <span className="font-semibold text-blue-300">{slot}</span></div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition duration-300 w-full"
        >
          Book Again
        </button>
      </div>
    </div>
  );
};

export default Success;
  