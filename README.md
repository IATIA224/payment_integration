# 🛒 PayMongo E-Commerce Practice Project

A full-stack sample e-commerce application built with **React + Vite** (frontend) and **Node.js + Express** (backend), integrated with **PayMongo Sandbox** for practicing payment processing.

---

## 🗂 Project Structure

```
payment_integration_practice/
├── backend/
│   ├── routes/
│   │   └── payment.js       # PayMongo API routes
│   ├── server.js            # Express server
│   ├── .env                 # 🔒 Your API keys (not committed)
│   └── .env.example         # Template for .env
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Cart context (state management)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example         # Template for frontend .env
│   ├── vite.config.js       # Vite dev server + API proxy
│   └── index.html
└── README.md
```

---

## ⚙️ Getting Started

### 1. Get PayMongo Sandbox API Keys

1. Sign up at [https://dashboard.paymongo.com](https://dashboard.paymongo.com)
2. Go to **Developers → API Keys**
3. Copy your **Test Public Key** (`pk_test_…`) and **Test Secret Key** (`sk_test_…`)

---

### 2. Configure Environment Variables

#### Backend
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env`:
```env
PAYMONGO_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
PAYMONGO_SECRET_KEY=sk_test_YOUR_KEY_HERE
PORT=5000
FRONTEND_URL=http://localhost:5173
```

#### Frontend (optional — public key only needed if calling PayMongo directly)
```bash
cd frontend
cp .env.example .env
```

---

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 4. Run the App

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
```
> Server runs at `http://localhost:5000`

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```
> App runs at `http://localhost:5173`

---

## 💳 PayMongo Sandbox Test Cards

| Card Number           | Result              |
|-----------------------|---------------------|
| `4120000000000007`    | ✅ Payment succeeds  |
| `4111111111111111`    | ❌ Payment declined  |
| `4130000000000003`    | ⚠️ 3D Secure auth   |

- Use any future expiry date (e.g., `12 / 2030`)
- Use any 3-digit CVC (e.g., `123`)

---

## 🧪 Payment Methods Supported

| Method       | Flow |
|--------------|------|
| Credit/Debit Card | PaymentIntent + PaymentMethod API |
| GCash        | Source API → redirect → webhook |
| Maya (PayMaya) | Source API → redirect → webhook |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/health` | Health check |
| POST   | `/api/payment/create-payment-intent` | Create a PaymentIntent |
| POST   | `/api/payment/create-payment-method` | Create a card PaymentMethod |
| POST   | `/api/payment/attach-payment-method` | Attach PaymentMethod to Intent |
| POST   | `/api/payment/create-source` | Create GCash/Maya source |
| POST   | `/api/payment/create-payment` | Create payment from source |
| GET    | `/api/payment/payment-intent/:id` | Get PaymentIntent status |

---

## 🔐 Security Notes

- **Never commit your `.env` file** — it is already in `.gitignore`
- The `.env.example` files contain placeholder values only
- The **Secret Key** must only be used server-side (backend)
- The **Public Key** can be used client-side if needed

---

## 📚 Resources

- [PayMongo Documentation](https://developers.paymongo.com)
- [PayMongo Dashboard](https://dashboard.paymongo.com)
- [PayMongo Sandbox Guide](https://developers.paymongo.com/docs/testing)
