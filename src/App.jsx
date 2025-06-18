import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Booking from './pages/Booking';
import UploadReceipt from './pages/UploadReceipt';
import Success from './pages/Success';
import Payment from './pages/Payment';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/upload" element={<UploadReceipt />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </Router>
  );
}

export default App;
