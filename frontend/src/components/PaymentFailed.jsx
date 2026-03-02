import React from 'react';
import { Link } from 'react-router-dom';

export default function PaymentFailed() {
  return (
    <div className="result-page">
      <div className="result-icon">❌</div>
      <div className="result-title" style={{ color: 'var(--danger)' }}>Payment Failed</div>
      <div className="result-msg">
        Something went wrong with your payment. Your cart has been kept intact — please try again.
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/checkout" className="btn btn-primary">Try Again</Link>
        <Link to="/cart" className="btn btn-outline">Back to Cart</Link>
      </div>
    </div>
  );
}
