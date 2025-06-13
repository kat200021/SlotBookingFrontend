const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const getWeekday = (dateString) => {
    const parts = dateString.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };  

  router.get('/available', async (req, res) => {
    const { name, date } = req.query;
  
    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date are required' });
    }
  
    // 1. Get availability
    const { data: availability, error: availError } = await supabase
      .from('availability')
      .select('*')
      .ilike('person_name', name)
      .single();
  
    if (availError) return res.status(500).json({ error: availError.message });

    if (!availability) {
        return res.status(404).json({ error: `No availability found for this person: ${name}` });
      }
    
    const weekday = getWeekday(date);

    const timeSlots = availability.time_slots;
  
    // 2. Get already booked time slots
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('time_slot')
      .eq('person_name', name)
      .eq('date', date);
  
    if (bookingError) return res.status(500).json({ error: bookingError.message });
  
    const bookedSlots = bookings.map(b => b.time_slot);
    const available = timeSlots.filter(slot => !bookedSlots.includes(slot));

    if (availability.days.includes(weekday)) {
        return res.json({ available_slots: available });
      }
    else {
        return res.json('Not available on weekends');
      }
  
    
  });
  
  // POST /api/slots/book
    router.post('/book', async (req, res) => {
    const { person_name, date, time_slot, user_email } = req.body;
  
    if (!person_name || !date || !time_slot || !user_email) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      // Step 1: Check if the slot is already booked
      const { data: existing, error: checkError } = await supabase
        .from('bookings')
        .select('*')
        .eq('person_name', person_name)
        .eq('date', date)
        .eq('time_slot', time_slot)
        .maybeSingle();
  
      if (checkError) {
        return res.status(500).json({ error: checkError.message });
      }
  
      if (existing) {
        return res.status(400).json({ error: 'Slot already booked' });
      }
  
      // Step 2: Insert booking
      const { data: inserted, error: insertError } = await supabase
        .from('bookings')
        .insert([
          {
            person_name,
            date,
            time_slot,
            user_email
          }
        ])
        .select();
  
      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }

      const booking = inserted[0];
  
      //return res.json({ message: 'Booking successful' });
      return res.json({
        message: 'Booking successful',
        booking_id: booking.id,
        person_name: booking.person_name,
        date: booking.date,
        time_slot: booking.time_slot
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });


    // POST /api/slots/upload-receipt
    router.post('/upload-receipt', upload.single('receipt'), async (req, res) => {
        const { booking_id, transaction_id } = req.body;
        const file = req.file;
    
        if (!booking_id || (!file && !transaction_id)) {
        return res.status(400).json({ error: 'Booking ID and either receipt or transaction ID required' });
        }
    
        let receiptUrl = null;
    
        if (file) {
        const fileExt = file.originalname.split('.').pop();
        const filePath = `receipts/${uuidv4()}.${fileExt}`;

        console.log(filePath)
    
        const { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(filePath, file.buffer, {
            contentType: file.mimetype
            });
    
        if (uploadError) {
            return res.status(500).json({ error: uploadError.message });
        }
    
        const { data: publicUrlData } = supabase.storage
            .from('receipts')
            .getPublicUrl(filePath);
    
        receiptUrl = publicUrlData.publicUrl;
        }
        console.log(receiptUrl)
    
        const updateData = {
        ...(transaction_id && { transaction_id }),
        ...(receiptUrl && { receipt_url: receiptUrl })
        };

        console.log(updateData)
    
        const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', booking_id);
    
        if (updateError) {
        return res.status(500).json({ error: updateError.message });
        }

        // Fetch user's email from the bookings table
        const { data: bookingData, error: fetchError } = await supabase
          .from('bookings')
          .select('user_email, person_name, date, time_slot')
          .eq('id', booking_id)
          .single();

        if (fetchError || !bookingData) {
          return res.status(500).json({ error: 'Failed to fetch user email.' });
        }

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });
        
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: bookingData.user_email,
          subject: 'Appointment Confirmation',
          html: `
            <h2>Booking Confirmed</h2>
            <p>Dear User,</p>
            <p>Your appointment has been confirmed with the following details:</p>
            <ul>
              <li><strong>Name:</strong> ${bookingData.person_name}</li>
              <li><strong>Date:</strong> ${bookingData.date}</li>
              <li><strong>Time Slot:</strong> ${bookingData.time_slot}</li>
            </ul>
            <p>Thank you for booking!</p>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
        } catch (emailErr) {
          console.error('Email sending failed:', emailErr);
        }

        res.json({ message: 'Receipt info uploaded successfully' });
  });

module.exports = router;
