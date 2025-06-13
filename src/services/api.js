export const BASE_URL = 'https://slotbooking-backend-yz6k.onrender.com';

export const getAllPeople = async () => {
    const res = await fetch(`${BASE_URL}/api/people`);
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
  };
  

export const getAvailableSlots = async (name, date) => {
    const params = new URLSearchParams({ name, date });
    const res = await fetch(`${BASE_URL}/api/slots/available?${params}`);
    if (!res.ok) throw new Error('Failed to fetch available slots');
    return res.json();
  };

  