import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

// Sample products for the practice store
const PRODUCTS = [
  { id: 1, name: 'Wireless Headphones', emoji: '🎧', price: 1500, category: 'Electronics',
    desc: 'Premium sound quality with 30-hour battery life.' },
  { id: 2, name: 'Smart Watch', emoji: '⌚', price: 3200, category: 'Electronics',
    desc: 'Tracks fitness, sleep, and notifications.' },
  { id: 3, name: 'Running Shoes', emoji: '👟', price: 2800, category: 'Footwear',
    desc: 'Lightweight and breathable for all-day runs.' },
  { id: 4, name: 'Coffee Maker', emoji: '☕', price: 1800, category: 'Kitchen',
    desc: 'Brews the perfect cup every morning.' },
  { id: 5, name: 'Backpack', emoji: '🎒', price: 950, category: 'Accessories',
    desc: 'Water-resistant 30L everyday carry pack.' },
  { id: 6, name: 'Mechanical Keyboard', emoji: '⌨️', price: 2200, category: 'Electronics',
    desc: 'Tactile switches for a satisfying typing experience.' },
  { id: 7, name: 'Sunglasses', emoji: '🕶️', price: 780, category: 'Accessories',
    desc: 'UV400 polarized lenses with metal frame.' },
  { id: 8, name: 'Water Bottle', emoji: '🍶', price: 350, category: 'Lifestyle',
    desc: 'Insulated 750ml stainless steel bottle.' },
];

const formatPrice = (p) => `₱${p.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function ProductList() {
  const { addToCart, cart } = useCart();
  const [added, setAdded] = useState({});
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(PRODUCTS.map((p) => p.category))];

  const filtered = filter === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  const handleAdd = (product) => {
    addToCart(product);
    setAdded((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [product.id]: false })), 1200);
  };

  const inCart = (id) => cart.find((i) => i.id === id)?.qty || 0;

  return (
    <div>
      <h1 className="page-title">🛍️ Products</h1>

      {/* Category Filter */}
      <div className="method-tabs" style={{ marginBottom: '1.5rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`method-tab ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filtered.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-img">{product.emoji}</div>
            <div className="product-info">
              <span className="product-cat">{product.category}</span>
              <div className="product-name">{product.name}</div>
              <div className="product-desc">{product.desc}</div>
              <div className="product-price">{formatPrice(product.price)}</div>
              <button
                className={`btn btn-full ${added[product.id] ? 'btn-success' : 'btn-primary'}`}
                onClick={() => handleAdd(product)}
              >
                {added[product.id] ? '✓ Added!' : inCart(product.id) > 0
                  ? `Add More (${inCart(product.id)} in cart)`
                  : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
