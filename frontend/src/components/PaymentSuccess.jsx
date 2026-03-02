import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (p) =>
  `₱${Number(p).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function PaymentSuccess() {
  const location = useLocation();
  const { clearCart } = useCart();

  // State passed from Checkout (card flow) or URL param (e-wallet redirect)
  const state = location.state || {};
  const params = new URLSearchParams(location.search);

  // For e-wallet, PayMongo adds ?payment_intent_id or source info to the URL
  const ref = state.ref || params.get('payment_intent_id') || params.get('source_id') || '—';
  const amount = state.amount || null;

  useEffect(() => {
    // Clear cart and pending order on success
    clearCart();
    sessionStorage.removeItem('pendingOrder');
  }, []); // eslint-disable-line

  return (
    <div className="result-page">
      <div className="result-icon">🎉</div>
      <div className="result-title" style={{ color: 'var(--success)' }}>Payment Successful!</div>
      <div className="result-msg">
        Your order has been placed. Thank you for shopping with PayMongo Shop!
      </div>

      <div className="card" style={{ maxWidth: 420, margin: '0 auto 2rem', textAlign: 'left' }}>
        <div className="section-title">Payment Details</div>
        <div className="summary-row">
          <span>Reference ID</span>
          <span style={{ fontFamily: 'monospace', fontSize: '.85rem', wordBreak: 'break-all' }}>{ref}</span>
        </div>
        {amount && (
          <div className="summary-row">
            <span>Amount Paid</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatPrice(amount)}</span>
          </div>
        )}
        <div className="summary-row">
          <span>Mode</span>
          <span style={{ background: '#fef9c3', color: '#713f12', padding: '1px 8px', borderRadius: '999px', fontSize: '.8rem' }}>
            Sandbox
          </span>
        </div>
      </div>

      <Link to="/" className="btn btn-primary">Continue Shopping</Link>
    </div>
  );
}
