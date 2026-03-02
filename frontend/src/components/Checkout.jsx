import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const API = '/api/payment';
const formatPrice = (p) => `₱${p.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

// ── Sandbox test card numbers ────────────────────────────────────────────────
const TEST_CARDS = [
  { label: '✅ Success', number: '4120000000000007', brand: 'Visa' },
  { label: '❌ Declined', number: '4111111111111111', brand: 'Visa' },
  { label: '⚠️ 3DS Auth',  number: '4130000000000003', brand: 'Visa' },
];

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();

  // Payment method tab
  const [method, setMethod] = useState('card'); // 'card' | 'gcash' | 'paymaya'

  // Billing info
  const [billing, setBilling] = useState({ name: '', email: '', phone: '' });

  // Card details
  const [card, setCard] = useState({ number: '', expMonth: '', expYear: '', cvc: '' });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shipping = total >= 2000 ? 0 : 150;
  const orderTotal = total + shipping;
  const amountInCents = Math.round(orderTotal * 100);

  if (cart.length === 0) {
    return (
      <div className="result-page">
        <div className="result-icon">🛒</div>
        <div className="result-title">Cart is Empty</div>
        <Link to="/" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  // ── Card Payment Flow ──────────────────────────────────────────────────────
  const handleCardPayment = async () => {
    setError('');
    setLoading(true);
    try {
      // 1. Create Payment Intent
      const { data: intentData } = await axios.post(`${API}/create-payment-intent`, {
        amount: amountInCents,
        description: `Order from PayMongo Shop (${cart.length} items)`,
      });
      const paymentIntentId = intentData.data.id;
      const clientKey = intentData.data.attributes.client_key;

      // 2. Create Payment Method
      const { data: pmData } = await axios.post(`${API}/create-payment-method`, {
        cardNumber: card.number.replace(/\s/g, ''),
        expMonth: parseInt(card.expMonth),
        expYear: parseInt(card.expYear),
        cvc: card.cvc,
        billingName: billing.name,
        billingEmail: billing.email,
        billingPhone: billing.phone,
      });
      const paymentMethodId = pmData.data.id;

      // 3. Attach Payment Method
      const { data: attachData } = await axios.post(`${API}/attach-payment-method`, {
        paymentIntentId,
        paymentMethodId,
        clientKey,
      });

      const status = attachData.data.attributes.status;

      if (status === 'succeeded') {
        clearCart();
        navigate('/payment-success', { state: { method: 'card', ref: paymentIntentId, amount: orderTotal } });
      } else if (status === 'awaiting_next_action') {
        // 3D Secure redirect
        const redirectUrl = attachData.data.attributes.next_action?.redirect?.url;
        if (redirectUrl) window.location.href = redirectUrl;
        else setError('3D Secure authentication required but no redirect URL found.');
      } else {
        setError(`Payment status: ${status}. Please try again.`);
      }
    } catch (err) {
      const msgs = err.response?.data?.error;
      if (Array.isArray(msgs)) {
        setError(msgs.map((e) => e.detail).join(' '));
      } else {
        setError(msgs || 'Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── E-Wallet Flow (GCash / PayMaya) ───────────────────────────────────────
  const handleEWalletPayment = async () => {
    setError('');
    setLoading(true);
    try {
      const { data: sourceData } = await axios.post(`${API}/create-source`, {
        amount: amountInCents,
        type: method,
        description: `Order from PayMongo Shop (${cart.length} items)`,
        billingName: billing.name,
        billingEmail: billing.email,
        billingPhone: billing.phone,
      });

      const checkoutUrl = sourceData.data.attributes.redirect?.checkout_url;
      if (checkoutUrl) {
        // Store cart info in session so we can clear it on return
        sessionStorage.setItem('pendingOrder', JSON.stringify({ amount: orderTotal }));
        window.location.href = checkoutUrl;
      } else {
        setError('No checkout URL returned. Check your PayMongo API keys.');
      }
    } catch (err) {
      const msgs = err.response?.data?.error;
      if (Array.isArray(msgs)) {
        setError(msgs.map((e) => e.detail).join(' '));
      } else {
        setError(msgs || 'Failed to create payment source.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (method === 'card') handleCardPayment();
    else handleEWalletPayment();
  };

  // Auto-format card number with spaces
  const handleCardNumber = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(.{4})/g, '$1 ').trim();
    setCard((p) => ({ ...p, number: formatted }));
  };

  return (
    <div>
      <h1 className="page-title">💳 Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="checkout-layout">
          {/* Left: Payment Form */}
          <div>
            {/* Billing Info */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div className="section-title">📋 Billing Information</div>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required value={billing.name}
                  onChange={(e) => setBilling((b) => ({ ...b, name: e.target.value }))}
                  placeholder="Juan Dela Cruz" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" required value={billing.email}
                    onChange={(e) => setBilling((b) => ({ ...b, email: e.target.value }))}
                    placeholder="juan@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" type="tel" required value={billing.phone}
                    onChange={(e) => setBilling((b) => ({ ...b, phone: e.target.value }))}
                    placeholder="+639XXXXXXXXX" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <div className="section-title">💰 Payment Method</div>

              {/* Method Tabs */}
              <div className="method-tabs">
                {['card', 'gcash', 'paymaya'].map((m) => (
                  <button key={m} type="button"
                    className={`method-tab ${method === m ? 'active' : ''}`}
                    onClick={() => setMethod(m)}>
                    {{ card: '💳 Credit/Debit Card', gcash: '📱 GCash', paymaya: '💚 Maya' }[m]}
                  </button>
                ))}
              </div>

              {/* Sandbox notice */}
              <div className="sandbox-notice">
                <strong>🧪 Sandbox Mode — No real money involved</strong>
                {method === 'card' && (
                  <span>Use a test card number below. Any future exp date and any 3-digit CVC work.</span>
                )}
                {method !== 'card' && (
                  <span>You'll be redirected to a PayMongo sandbox page — no real account needed.</span>
                )}
              </div>

              {/* Card Form */}
              {method === 'card' && (
                <>
                  {/* Test card helper */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div className="form-label">Quick-fill test card:</div>
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                      {TEST_CARDS.map((tc) => (
                        <button key={tc.number} type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setCard((c) => ({
                            ...c,
                            number: tc.number.replace(/(.{4})/g, '$1 ').trim(),
                            expMonth: '12', expYear: '2030', cvc: '123',
                          }))}>
                          {tc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Card Number *</label>
                    <input className="form-input" required value={card.number}
                      onChange={handleCardNumber} placeholder="1234 5678 9012 3456"
                      maxLength={19} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Expiry Month *</label>
                      <input className="form-input" required value={card.expMonth}
                        onChange={(e) => setCard((c) => ({ ...c, expMonth: e.target.value }))}
                        placeholder="12" maxLength={2} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expiry Year *</label>
                      <input className="form-input" required value={card.expYear}
                        onChange={(e) => setCard((c) => ({ ...c, expYear: e.target.value }))}
                        placeholder="2030" maxLength={4} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVC *</label>
                      <input className="form-input" required value={card.cvc}
                        onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))}
                        placeholder="123" maxLength={4} type="password" />
                    </div>
                  </div>
                </>
              )}

              {/* E-Wallet info */}
              {method !== 'card' && (
                <div className="alert alert-info">
                  Click <strong>Pay Now</strong> to be redirected to the{' '}
                  {method === 'gcash' ? 'GCash' : 'Maya'} sandbox checkout page.
                </div>
              )}

              {/* Error */}
              {error && <div className="alert alert-error">{error}</div>}
            </div>
          </div>

          {/* Right: Order Summary */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '80px' }}>
              <div className="section-title">🧾 Order Summary</div>
              {cart.map((item) => (
                <div className="summary-row" key={item.id}>
                  <span>{item.emoji} {item.name} × {item.qty}</span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
              <hr className="divider" />
              <div className="summary-row">
                <span>Subtotal</span><span>{formatPrice(total)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : formatPrice(shipping)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total</span><span>{formatPrice(orderTotal)}</span>
              </div>

              <button type="submit" className="btn btn-primary btn-full"
                style={{ marginTop: '1.25rem' }} disabled={loading}>
                {loading ? <><span className="spinner" /> Processing…</> : `Pay ${formatPrice(orderTotal)}`}
              </button>

              <Link to="/cart" className="btn btn-outline btn-full" style={{ marginTop: '.5rem' }}>
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
