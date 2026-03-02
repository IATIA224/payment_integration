import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (p) => `₱${p.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function Cart() {
  const { cart, removeFromCart, updateQty, total } = useCart();

  if (cart.length === 0) {
    return (
      <div>
        <h1 className="page-title">🛒 Your Cart</h1>
        <div className="card empty-cart">
          <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>🛒</div>
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const shipping = total >= 2000 ? 0 : 150;
  const orderTotal = total + shipping;

  return (
    <div>
      <h1 className="page-title">🛒 Your Cart</h1>
      <div className="cart-layout">
        {/* Items */}
        <div className="card">
          {cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-emoji">{item.emoji}</div>
              <div>
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{formatPrice(item.price)} each</div>
              </div>
              <div className="qty-ctrl">
                <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                <span className="qty-num">{item.qty}</span>
                <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.4rem' }}>
                <span className="cart-item-total">{formatPrice(item.price * item.qty)}</span>
                <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div className="card">
            <div className="section-title">Order Summary</div>
            <div className="summary-row">
              <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : formatPrice(shipping)}</span>
            </div>
            {shipping > 0 && (
              <div className="alert alert-info" style={{ fontSize: '.8rem' }}>
                Add {formatPrice(2000 - total)} more for free shipping!
              </div>
            )}
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatPrice(orderTotal)}</span>
            </div>

            <Link to="/checkout" className="btn btn-primary btn-full" style={{ marginTop: '.75rem' }}>
              Proceed to Checkout →
            </Link>
            <Link to="/" className="btn btn-outline btn-full" style={{ marginTop: '.5rem' }}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
