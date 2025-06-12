const express = require('express');
const cors = require('cors');
require('dotenv').config();

const slotRoutes = require('./routes/slots');
const peopleRoutes = require('./routes/people');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/slots', slotRoutes);
app.use('/api/people', peopleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
