import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BASE_URL } from '../services/api';
import { FileUp, Send, UploadCloud } from 'lucide-react';

const UploadReceipt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  const booking_id = query.get('booking_id');
  const name = query.get('name');
  const date = query.get('date');
  const time_slot = query.get('slot');

  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!booking_id) return setError('Missing booking ID.');
    if (!transactionId && !receiptFile) {
      return setError('Please enter a transaction ID or upload a receipt file.');
    }

    setUploading(true);
    setError('');

    let receipt_url = null;

    // Submit transaction ID or upload a receipt file info
    try {
      const formData = new FormData();
      formData.append('booking_id', booking_id);
      if (transactionId) formData.append('transaction_id', transactionId);
      if (receiptFile) formData.append('receipt', receiptFile);

      const res = await fetch(`${BASE_URL}/api/slots/upload-receipt`, {
        method: 'POST',
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error('Server error. Please try again later.');
      }
      if (!res.ok) throw new Error(data?.error || 'Failed to submit receipt');

      // const data = await res.json();
      // if (!res.ok) throw new Error(data.error || 'Failed to submit receipt');

      navigate('/'); // or a success page
    } catch (err) {
      setError('Submission failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Upload Receipt</h1>

        <div className="mb-6 text-center text-lg">
          Booking for <span className="font-semibold text-blue-400">{name}</span> on{' '}
          <span className="font-semibold text-blue-400">{date}</span> at{' '}
          <span className="font-semibold text-blue-400">{time_slot}</span>
        </div>

        <div className="space-y-6">
          {/* Transaction ID input */}
          <div>
            <label className="block text-sm mb-2">Transaction ID</label>
            <div className="relative">
              <Send className="absolute left-3 top-3 text-white/50 w-5 h-5" />
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter transaction ID"
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* File Upload */}

          <div>
            <label className="block text-sm mb-2">Or Upload the Receipt Screenshot</label>
            <div className="flex items-center gap-4">
              {/* Hidden input, triggers on icon click */}
              <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="text-blue-400 w-6 h-6" />
                <span className="text-sm text-blue-200 underline">Choose File</span>
              </label>
              {receiptFile && <span className="text-sm text-gray-300">{receiptFile.name}</span>}
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleSubmit}
            disabled={uploading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition duration-300"
          >
            {uploading ? 'Submitting...' : 'Submit'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default UploadReceipt;
