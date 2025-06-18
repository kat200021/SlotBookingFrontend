export const BASE_URL = 'https://slotbooking-backend-yz6k.onrender.com';

export const getAllPeople = async () => {
  const res = await fetch(`${BASE_URL}/api/people`);
  if (!res.ok) throw new Error('Failed to fetch people');
  return res.json();
};

export const getOccupations = async () => {
  const res = await fetch(`${BASE_URL}/api/people/occupations`);
  if (!res.ok) throw new Error('Failed to fetch occupations');
  return res.json();
};

export const getAvailableSlots = async (date, occupation, name = null) => {
  const params = new URLSearchParams({ date, occupation });
  if (name) params.append('name', name);
  const res = await fetch(`${BASE_URL}/api/slots/available?${params}`);
  if (!res.ok) throw new Error('Failed to fetch available slots');
  return res.json();
};

  