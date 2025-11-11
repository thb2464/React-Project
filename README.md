# 🍔 Fast Food Delivery — Drone-based Food Delivery Platform

## 🚀 Overview
**Fast Food Delivery** is a cross-platform web and mobile application designed to revolutionize food delivery using **drone technology**.  
The platform allows users to order food quickly, track their delivery in real time, and enjoy a seamless ordering experience across web and mobile devices.

---

## 🧩 Problem Statement
Traditional food delivery often suffers from:
- Slow delivery times due to traffic and limited manpower.  
- Disconnected experience between web and mobile platforms.  
- Lack of real-time transparency in delivery tracking.

**Our goal:** Build a unified, user-friendly system that enables real-time drone-based delivery tracking and faster food delivery.

---

## 💡 Key Features

### 👤 User (Customer)
- Register/Login (Email, Google, Facebook)  
- Browse nearby restaurants  
- Add items to cart and place orders  
- Secure payment (credit card, e-wallet, limited COD)  
- Real-time **drone tracking on map**  
- Push notifications (order confirmation, drone departure/arrival)  
- Rate and review restaurants  

### 🛠️ Admin (System Management)
- Dashboard for live metrics: orders, drones, revenue, performance  
- Manage restaurants and partners  
- Manage menu items and pricing  
- Monitor and intervene in orders if drone issues occur  
- Track drones: battery, flight history, coverage area  
- Manage users and feedback  
- Payment reconciliation and invoice management  
- Send system-wide notifications (e.g. promotions, maintenance)  
- Analytics and reporting (popular dishes, satisfaction rates)

---

## ⚙️ System Flow

1. User opens the web/mobile app → selects restaurant and dishes.  
2. Frontend sends order data to backend → validates delivery zone.  
3. Backend assigns the nearest available drone.  
4. User proceeds to payment.  
5. Backend tracks delivery and updates database in real time.  
6. Admin dashboard shows live drone and order status.  
7. User tracks drone visually on a 2D map until delivery is complete.  

---

## 💳 Payment Flow
1. User chooses online payment → system generates `auth_code`.  
2. Backend integrates with payment gateways (e.g. Momo, Payoo, Stripe).  
3. After payment confirmation (via webhook), backend updates order status.  
4. Frontend displays “Payment Successful” and continues the process.


---

## 🧑‍💻 Tech Stack
| Layer | Technology |
|-------|-------------|
| Frontend (Web) | ReactJS |
| Mobile App | React Native |
| Backend | Node.js / Express |
| Database | Postgres |
| Payment Integration | Stripe, Momo, Payoo |
| Real-time Tracking | WebSocket / MQTT |
| Deployment | AWS / Firebase Hosting |


---

## Project Strucure

FASTFOODORDERING/
├── .gitignore
├── node_modules/
├── package.json
├── package-lock.json
├── tsconfig.json
├── apps/
│   ├── mobile/
│   └── web/
│       ├── .gitignore
│       ├── eslint.config.js
│       ├── index.html
│       ├── node_modules/
│       ├── package.json
│       ├── public/
│       ├── README.md
│       ├── src/
│       │   ├── assets/
│       │   ├── components/
│       │   │   ├── pages/
│       │   │   │   ├── AdminAnalyticsPage.tsx
│       │   │   │   ├── AdminDashboard.tsx
│       │   │   │   ├── AdminDronesPage.tsx
│       │   │   │   ├── AdminMenuPage.tsx
│       │   │   │   ├── AdminOrdersPage.tsx
│       │   │   │   ├── AdminPaymentsPage.tsx
│       │   │   │   ├── AdminRestaurants.tsx
│       │   │   │   ├── AdminRolesPage.tsx
│       │   │   │   ├── AdminUsersPage.tsx
│       │   │   │   ├── AuthPage.tsx
│       │   │   │   ├── CheckoutPage.tsx
│       │   │   │   ├── HomePage.tsx
│       │   │   │   ├── MenuPage.tsx
│       │   │   │   ├── OrdersPage.tsx
│       │   │   │   ├── ProfilePage.tsx
│       │   │   │   └── SupportPage.tsx
│       │   │   ├── shared/
│       │   │   │   ├── AdminLayout.tsx
│       │   │   │   ├── AdminSidebar.tsx
│       │   │   │   ├── CartContent.tsx
│       │   │   │   ├── CustomizeModal.tsx
│       │   │   │   ├── Header.tsx
│       │   │   │   ├── ItemCustomization.tsx
│       │   │   │   └── MenuItemCard.tsx
│       │   │   └── ui/
│       │   ├── data/
│       │   ├── hooks/
│       │   │   └── useAppState.ts
│       │   ├── services/
│       │   ├── styles/
│       │   │   ├── AdminAnalyticsPage.css
│       │   │   ├── AdminDronesPage.css
│       │   │   ├── AdminMenuPage.css
│       │   │   ├── AdminOrdersPage.css
│       │   │   ├── AdminPaymentsPage.css
│       │   │   ├── AdminRestaurants.css
│       │   │   ├── AdminRolesPage.css
│       │   │   ├── AdminUsersPage.css
│       │   │   ├── App.css
│       │   │   ├── AuthPage.css
│       │   │   ├── CartContent.css
│       │   │   ├── CheckoutPage.css
│       │   │   ├── CustomizeModal.css
│       │   │   ├── globals.css
│       │   │   ├── Header.css
│       │   │   ├── HomePage.css
│       │   │   ├── MenuItemCard.css
│       │   │   ├── MenuPage.css
│       │   │   ├── OrdersPage.css
│       │   │   ├── RestaurantDashboard.css
│       │   │   └── SupportPage.css
│       │   ├── types/
│       │   │   └── index.ts
│       │   ├── App.jsx
│       │   ├── App.tsx
│       │   ├── index.css
│       │   ├── index.jsx
│       │   └── main.tsx
│       └── vite.config.js
└── packages/
    ├── data/
    ├── hooks/
    ├── server/
    │   ├── .env
    │   ├── db.js
    │   ├── index.js
    │   ├── package.json
    │   ├── middleware/
    │   │   └── authenticateToken.js
    │   ├── node_modules/
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── drones.js
    │   │   ├── foodItems.js
    │   │   ├── orders.js
    │   │   └── restaurants.js
    │   └── uploads/
    ├── types/
    ├── ui/
    └── utils/
