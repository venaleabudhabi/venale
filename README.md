# REVIVE Refuel - VENALE 🥗

Production-ready QR Menu + Online Ordering System for REVIVE Refuel - VENALE venue.

## 🏗️ Architecture

- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database**: MongoDB Atlas
- **Payment**: Stripe Checkout
- **Auth**: JWT for admin/staff/driver
- **i18n**: English + Arabic (RTL support)
- **PWA**: Mobile-first Progressive Web App

## 📁 Project Structure

```
revive-menu-system/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/            # Database connection
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API endpoints
│   │   │   ├── admin/         # Admin CRUD routes
│   │   │   └── driver/        # Driver routes
│   │   ├── middleware/        # Auth & validation
│   │   ├── utils/             # Helper functions
│   │   ├── scripts/           # Seed script
│   │   └── server.ts          # Express app
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/               # Next.js pages (App Router)
│   │   │   ├── m/[venueSlug]/ # Customer menu pages
│   │   │   ├── o/[orderId]/   # Order tracking
│   │   │   └── admin/         # Admin panel
│   │   ├── components/        # Reusable components
│   │   ├── lib/               # API client, store, i18n
│   │   └── styles/            # Global CSS
│   ├── public/                # Static assets, PWA manifest
│   ├── package.json
│   └── next.config.js
└── package.json               # Workspace root

```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Stripe account (for card payments)

### 1. Clone and Install

```bash
cd "/Volumes/PERSONAL/REVIVE Refuel - VENALE"
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/revive-menu?retryWrites=true&w=majority

# Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Stripe keys from dashboard.stripe.com
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

FRONTEND_URL=http://localhost:3000

# Default admin credentials (used by seed script)
ADMIN_EMAIL=admin@revive.ae
ADMIN_PASSWORD=Admin123!
```

**Frontend** (`frontend/.env.local`):
```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_VENUE_SLUG=revive-refuel-venale
```

### 3. Seed Database

Populate MongoDB with menu data and create admin user:

```bash
cd backend
npm run seed
```

You should see:
```
✅ Venue created: REVIVE Refuel - VENALE
✅ Category created: Protein Shakes
...
✅ Admin user created: admin@revive.ae

🔐 Admin Login:
   Email: admin@revive.ae
   Password: Admin123!
```

### 4. Start Development Servers

**Option A: Run both servers concurrently (from root)**
```bash
npm run dev
```

**Option B: Run separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Customer Menu**: http://localhost:3000/m/revive-refuel-venale
- **Admin Panel**: http://localhost:3000/admin/login
  - Email: `admin@revive.ae`
  - Password: `Admin123!`
- **API Docs**: http://localhost:5000/health

## 📱 Features

### Customer Features
- ✅ Browse menu by categories
- ✅ Search items
- ✅ Filter by tags (Energy, Immunity, High Protein, etc.)
- ✅ View nutrition information
- ✅ Add items to cart with addons
- ✅ Checkout with phone validation (UAE format)
- ✅ Choose Pickup or Delivery (if enabled)
- ✅ Pay via Cash on Delivery or Card (Stripe)
- ✅ Member discount (15% for Revive members)
- ✅ Real-time order tracking
- ✅ English/Arabic language switcher with RTL
- ✅ Mobile-first PWA (installable)

### Admin Features
- ✅ Login with JWT authentication
- ✅ Orders Kanban (by status: Pending → Confirmed → Preparing → Ready → Completed)
- ✅ Update order status
- ✅ Assign drivers to delivery orders
- ✅ CRUD Categories (create, edit, hide, delete)
- ✅ CRUD Items (manage price, ingredients, nutrition, availability)
- ✅ CRUD Addon Groups
- ✅ Venue Settings:
  - Toggle delivery on/off
  - Set VAT percentage
  - Set delivery fee
  - Set minimum order
  - Update member discount %

### Driver Features (API ready)
- ✅ View assigned delivery orders
- ✅ Mark orders as completed

## 🗃️ Database Models

### Venue
- Venue settings (name, currency, languages, payment methods)
- Delivery toggle, fees, VAT, discounts

### Category
- Menu categories with sort order
- Multi-language support (EN/AR)
- Hide/show toggle

### Item
- Menu items with price, ingredients, nutrition
- Tags for filtering
- Multi-language support
- Addon group associations
- Hide/unavailable toggles

### AddonGroup
- Customization groups (e.g., Toppings)
- Min/max selection rules
- Options with prices

### Order
- Customer info (phone required, name optional)
- Fulfillment (pickup/delivery with address)
- Payment (COD/CARD with Stripe session)
- Items snapshot (prices frozen at order time)
- Status timeline with timestamps
- Member discount application
- Totals (subtotal, VAT, discount, delivery fee, total)

### User
- Admin/Manager/Staff/Driver roles
- JWT authentication
- Venue association

## 🔌 API Endpoints

### Public API

```
GET  /api/menu/:venueSlug?lang=en|ar          # Get full menu
GET  /api/menu/:venueSlug/search?q=...        # Search menu
POST /api/orders                               # Create order
GET  /api/orders/:id                           # Get order status
POST /api/payments/checkout                    # Create Stripe session
POST /api/payments/webhook                     # Stripe webhook
```

### Admin API (requires JWT)

```
POST /api/auth/login                           # Admin login

# Categories
GET    /api/admin/categories
POST   /api/admin/categories
PATCH  /api/admin/categories/:id
DELETE /api/admin/categories/:id

# Items
GET    /api/admin/items?categoryId=...
POST   /api/admin/items
PATCH  /api/admin/items/:id
DELETE /api/admin/items/:id

# Addon Groups
GET    /api/admin/addons
POST   /api/admin/addons
PATCH  /api/admin/addons/:id
DELETE /api/admin/addons/:id

# Orders
GET   /api/admin/orders?status=...
PATCH /api/admin/orders/:id/status

# Venue Settings
GET   /api/admin/venue/settings
PATCH /api/admin/venue/settings
```

### Driver API (requires JWT)

```
GET   /api/driver/orders/assigned
PATCH /api/driver/orders/:id/status
```

## 💳 Stripe Integration

### Setup Webhook

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` in `.env`

### Test Cards
- Success: `4242 4242 4242 4242`
- Declined: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

## 🌍 Internationalization

The system supports English and Arabic with full RTL layout for Arabic.

### Adding Translations

Edit `frontend/src/lib/i18n.ts`:

```typescript
export const translations = {
  en: {
    newKey: 'English text',
  },
  ar: {
    newKey: 'النص العربي',
  },
};
```

### Usage in Components

```typescript
const { t, dir } = useTranslation(lang);
return <div dir={dir}>{t('newKey')}</div>;
```

## 📱 PWA Configuration

The app is configured as a Progressive Web App:

- **Manifest**: `frontend/public/manifest.json`
- **Icons**: Place `icon-192.png` and `icon-512.png` in `frontend/public/`
- **Installable**: Users can add to home screen on mobile

## 🏗️ Production Build

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm start
```

### Deploy to Production

**Backend (e.g., Railway, Render, DigitalOcean)**:
1. Set environment variables
2. Deploy with: `npm run build && npm start`
3. Update CORS in backend to allow your frontend domain

**Frontend (e.g., Vercel, Netlify)**:
1. Connect GitHub repo
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/.next`
4. Add environment variables

**MongoDB Atlas**:
1. Whitelist production server IPs
2. Use connection string with strong password

**Stripe**:
1. Switch to live keys in production
2. Configure production webhook endpoint

## 🧪 Testing

### Test Order Flow

1. Browse menu at `/m/revive-refuel-venale`
2. Select category (e.g., Protein Shakes)
3. Add items to cart
4. Go to cart and checkout
5. Enter phone: `+971501234567`
6. Select Pickup
7. Choose COD or Card
8. Check "I am a Revive member" (15% discount applied)
9. Place order
10. Track order status

### Test Admin Flow

1. Login at `/admin/login`
2. View orders on Kanban board
3. Change order status
4. Go to Menu management
5. Add/edit categories and items
6. Update venue settings

## 🔒 Security

- ✅ JWT tokens with 7-day expiry
- ✅ Password hashing with bcrypt
- ✅ Helmet.js for HTTP headers
- ✅ CORS configuration
- ✅ Input validation with Zod
- ✅ Mongoose schema validation
- ✅ Stripe webhook signature verification

## 📊 Menu Data

The seed script uses `backend/src/scripts/menu-data.json` which includes:

- **8 Categories**: Protein Shakes, Healthy Bowls, Chia & Oats, Smoothies, Wellness Shots, Fruits Cup, Fresh Juices
- **70+ Items** with prices, ingredients, nutrition data
- **1 Addon Group**: Toppings (Strawberry, Blueberry, Banana, Peanut Butter, Granola)
- **Member Discount**: 15% for Revive members
- **Prices**: AED 10-30 range

### Updating Menu

To update the menu after initial seed:
1. Edit items in Admin Panel, OR
2. Update `menu-data.json` and run `npm run seed` again (idempotent)

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Ensure port 5000 is not in use
- Verify all env vars are set

### Frontend build errors
- Run `npm install` in frontend folder
- Check Node.js version (18+)
- Clear `.next` folder and rebuild

### Orders not creating
- Check backend logs
- Verify venue slug matches
- Check phone number format (+971XXXXXXXXX)

### Stripe payments failing
- Verify Stripe keys are correct
- Check webhook is running (local) or configured (production)
- Use test cards in test mode

## 📝 License

Proprietary - REVIVE Refuel - VENALE

## 🤝 Support

For issues or questions, contact the development team.

---

Built with ❤️ for REVIVE Refuel - VENALE
