import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { field, value } = req.query;

  if (!field || !value) return res.status(400).json({ error: 'Missing parameters' });

  const { data, error } = await supabase
    .from('users')
    .select(field)
    .eq(field, value);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ exists: data.length > 0 });
});

export default router;
