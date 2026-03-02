const express = require('express');
const axios = require('axios');
const router = express.Router();

const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';

// Helper to get base64-encoded secret key for Authorization header
const getAuthHeader = () => {
  const secretKey = process.env.PAYMONGO_SECRET_KEY;
  if (!secretKey) throw new Error('PAYMONGO_SECRET_KEY is not set in .env');
  return `Basic ${Buffer.from(secretKey + ':').toString('base64')}`;
};

// ─── CREATE PAYMENT INTENT ──────────────────────────────────────────────────
// Used for card payments
router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'PHP', description } = req.body;

  if (!amount || amount < 100) {
    return res.status(400).json({ error: 'Amount must be at least 100 cents (PHP 1.00)' });
  }

  try {
    const response = await axios.post(
      `${PAYMONGO_BASE_URL}/payment_intents`,
      {
        data: {
          attributes: {
            amount,            // in cents, e.g. 10000 = PHP 100.00
            payment_method_allowed: ['card', 'gcash', 'paymaya'],
            payment_method_options: { card: { request_three_d_secure: 'any' } },
            currency,
            description: description || 'E-Commerce Purchase',
            capture_type: 'automatic',
          },
        },
      },
      { headers: { Authorization: getAuthHeader(), 'Content-Type': 'application/json' } }
    );
    res.json({ data: response.data.data });
  } catch (err) {
    console.error('Create PaymentIntent error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.errors || err.message });
  }
});

// ─── ATTACH PAYMENT METHOD ──────────────────────────────────────────────────
// Attach a payment method to a payment intent (for card payments)
router.post('/attach-payment-method', async (req, res) => {
  const { paymentIntentId, paymentMethodId, clientKey } = req.body;

  if (!paymentIntentId || !paymentMethodId) {
    return res.status(400).json({ error: 'paymentIntentId and paymentMethodId are required' });
  }

  try {
    const response = await axios.post(
      `${PAYMONGO_BASE_URL}/payment_intents/${paymentIntentId}/attach`,
      {
        data: {
          attributes: {
            payment_method: paymentMethodId,
            client_key: clientKey,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
          },
        },
      },
      { headers: { Authorization: getAuthHeader(), 'Content-Type': 'application/json' } }
    );
    res.json({ data: response.data.data });
  } catch (err) {
    console.error('Attach PaymentMethod error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.errors || err.message });
  }
});

// ─── CREATE PAYMENT METHOD (Card) ───────────────────────────────────────────
// Create a payment method from card details using the PUBLIC key
router.post('/create-payment-method', async (req, res) => {
  const { cardNumber, expMonth, expYear, cvc, billingName, billingEmail, billingPhone } = req.body;

  try {
    const publicKey = process.env.PAYMONGO_PUBLIC_KEY;
    const authHeader = `Basic ${Buffer.from(publicKey + ':').toString('base64')}`;

    const response = await axios.post(
      `${PAYMONGO_BASE_URL}/payment_methods`,
      {
        data: {
          attributes: {
            type: 'card',
            details: {
              card_number: cardNumber,
              exp_month: parseInt(expMonth),
              exp_year: parseInt(expYear),
              cvc,
            },
            billing: {
              name: billingName,
              email: billingEmail,
              phone: billingPhone,
            },
          },
        },
      },
      { headers: { Authorization: authHeader, 'Content-Type': 'application/json' } }
    );
    res.json({ data: response.data.data });
  } catch (err) {
    console.error('Create PaymentMethod error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.errors || err.message });
  }
});

// ─── CREATE GCASH / PAYMAYA SOURCE ─────────────────────────────────────────
// For e-wallet payments (GCash, PayMaya)
router.post('/create-source', async (req, res) => {
  const { amount, type = 'gcash', description, billingName, billingEmail, billingPhone } = req.body;

  if (!amount || amount < 100) {
    return res.status(400).json({ error: 'Amount must be at least 100 cents' });
  }

  try {
    const response = await axios.post(
      `${PAYMONGO_BASE_URL}/sources`,
      {
        data: {
          attributes: {
            amount,
            currency: 'PHP',
            type,
            description: description || 'E-Commerce Purchase',
            redirect: {
              success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-success`,
              failed: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-failed`,
            },
            billing: {
              name: billingName,
              email: billingEmail,
              phone: billingPhone,
            },
          },
        },
      },
      { headers: { Authorization: getAuthHeader(), 'Content-Type': 'application/json' } }
    );
    res.json({ data: response.data.data });
  } catch (err) {
    console.error('Create Source error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.errors || err.message });
  }
});

// ─── CREATE PAYMENT (from Source) ───────────────────────────────────────────
// After source is chargeable (e-wallet flow)
router.post('/create-payment', async (req, res) => {
  const { sourceId, amount, description } = req.body;

  try {
    const response = await axios.post(
      `${PAYMONGO_BASE_URL}/payments`,
      {
        data: {
          attributes: {
            amount,
            currency: 'PHP',
            description: description || 'E-Commerce Purchase',
            source: { id: sourceId, type: 'source' },
          },
        },
      },
      { headers: { Authorization: getAuthHeader(), 'Content-Type': 'application/json' } }
    );
    res.json({ data: response.data.data });
  } catch (err) {
    console.error('Create Payment error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.errors || err.message });
  }
});

// ─── GET PAYMENT INTENT STATUS ───────────────────────────────────────────────
router.get('/payment-intent/:id', async (req, res) => {
  const { id } = req.params;
  const { clientKey } = req.query;

  try {
    const response = await axios.get(
      `${PAYMONGO_BASE_URL}/payment_intents/${id}?client_key=${clientKey}`,
      { headers: { Authorization: getAuthHeader() } }
    );
    res.json({ data: response.data.data });
  } catch (err) {
    console.error('Get PaymentIntent error:', err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.errors || err.message });
  }
});

module.exports = router;
