import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

const UPI_AMOUNT = 500; //Change the value later
const UPI_QR_URL = '/testQR.png'; 

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const bookingId = searchParams.get('booking_id');
  const name = searchParams.get('name');
  const date = searchParams.get('date');
  const slot = searchParams.get('slot');

  useEffect(() => {
    if (!bookingId) {
      // If no booking, redirect to home
      navigate('/');
    }
  }, [bookingId, navigate]);

  const handleDone = () => {
    // Go to upload receipt page
    navigate(`/upload?booking_id=${bookingId}&name=${encodeURIComponent(name)}&date=${encodeURIComponent(date)}&slot=${encodeURIComponent(slot)}`);
  };

  return (
    <div className="relative bg-gray-50 dark:bg-gray-900 py-10 min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Payment</h2>
        <p className="text-lg text-white mb-2">Amount to Pay:</p>
        <div className="text-3xl font-bold text-blue-400 mb-6">₹{UPI_AMOUNT}</div>
        <p className="text-white mb-2">Scan the UPI QR code below to pay</p>
        <div className="flex justify-center mb-6">
          <img src={UPI_QR_URL} alt="UPI QR Code" className="w-48 h-48 rounded-lg border border-gray-300 bg-white" />
        </div>
        <button
          onClick={handleDone}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition duration-300 w-full"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default Payment; 