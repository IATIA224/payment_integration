import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailed from './components/PaymentFailed';
import { CartProvider, useCart } from './context/CartContext';

function NavBar() {
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, i) => sum + i.qty, 0);
  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">🛒 PayMongo Shop</Link>
      <div className="nav-links">
        <Link to="/">Products</Link>
        <Link to="/cart" className="cart-link">
          Cart {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <CartProvider>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
        </Routes>
      </main>
    </CartProvider>
  );
}
