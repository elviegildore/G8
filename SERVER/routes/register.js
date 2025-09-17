import express from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { fullname, serial_number, password, ...rest } = req.body;

  // Check duplicates
  const { data: userCheck } = await supabase
    .from('users')
    .select('id')
    .or(`fullname.eq.${fullname},serial_number.eq.${serial_number}`);

  if (userCheck.length > 0) {
    return res.status(400).json({ error: 'Fullname or serial number already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ fullname, serial_number, password: hashedPassword, ...rest }]);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ message: 'User registered successfully' });
});

export default router;
