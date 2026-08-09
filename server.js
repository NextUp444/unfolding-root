require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const products = {
  'growth-butter': { name: 'Growth From Scratch Tee — Butter', price: 4200 },
  'growth-ivory': { name: 'Growth From Scratch Tee — Ivory', price: 4200 },
  'growth-khaki': { name: 'Growth From Scratch Tee — Khaki', price: 4200 },
  'lowslow-ivory': { name: 'Low and Slow Tee — Ivory', price: 3800 },
};

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });

    const line_items = items.map(({ id, qty }) => {
      const product = products[id];
      if (!product) throw new Error(`Invalid product: ${id}`);
      return {
        price_data: { currency: 'usd', product_data: { name: product.name }, unit_amount: product.price },
        quantity: qty,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success.html`,
      cancel_url: `${req.protocol}://${req.get('host')}/cart.html`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));