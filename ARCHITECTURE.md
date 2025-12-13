# REVIVE Refuel - VENALE
## Complete Architecture & Technology Documentation

---

## 🏗️ System Architecture

### **Architecture Pattern**
- **Type**: Full-Stack Web Application (Three-Tier Architecture)
- **Pattern**: RESTful API with Server-Side Rendering (SSR)
- **Deployment Model**: Microservices-ready monorepo structure

### **High-Level Overview**
```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  Next.js 14 (App Router) + React 18 + TailwindCSS          │
│  Progressive Web App (PWA) Capable                          │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST API
                   │ Port 3000 → 5001
┌──────────────────▼──────────────────────────────────────────┐
│                   API/Business Layer                         │
│  Express.js + TypeScript + JWT Auth                         │
│  RESTful Endpoints + Validation (Zod)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │ Mongoose ODM
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                   Data Layer                                 │
│  MongoDB (NoSQL Database)                                    │
│  Collections: venues, categories, items, orders, users      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Frontend Technology Stack

### **Core Framework**
- **Next.js 14.0.4** (React Framework)
  - App Router (latest routing paradigm)
  - Server Components & Client Components
  - File-based routing
  - Automatic code splitting
  - Built-in image optimization

- **React 18.2.0**
  - Concurrent rendering
  - Automatic batching
  - Hooks-based architecture

### **UI & Styling**
- **TailwindCSS 3.4.0**
  - Utility-first CSS framework
  - JIT (Just-In-Time) compilation
  - Custom theme configuration
  - Responsive design utilities
  
- **PostCSS 8.4.32**
  - CSS processing and optimization
  - Autoprefixer integration

### **State Management**
- **Zustand 4.4.7**
  - Lightweight state management
  - Persist middleware for localStorage
  - Stores:
    - `useLanguageStore` - Language preference (en/ar)
    - `useCartStore` - Shopping cart state

### **Data Fetching & Caching**
- **TanStack React Query 5.17.0** (formerly React Query)
  - Server state management
  - Automatic background refetching
  - Cache invalidation
  - Optimistic updates
  - Real-time polling (10s intervals for orders)

### **HTTP Client**
- **Axios 1.6.5**
  - Promise-based HTTP client
  - Request/response interceptors
  - Automatic JSON transformation

### **Internationalization (i18n)**
- **Custom Translation System**
  - `useTranslation` hook
  - Bilingual support (English/Arabic)
  - RTL (Right-to-Left) layout support
  - Nested translation keys with dot notation

### **UI/UX Libraries**
- **React Hot Toast 2.4.1**
  - Toast notifications
  - Success/error feedback
  
- **clsx 2.1.0**
  - Conditional className composition

### **Progressive Web App (PWA)**
- Service Worker support
- Web App Manifest
- Offline capability
- Installable on mobile devices

### **TypeScript**
- **TypeScript 5.3.3**
  - Static type checking
  - Enhanced IDE support
  - Interface definitions for all data models

---

## ⚙️ Backend Technology Stack

### **Runtime & Framework**
- **Node.js** (JavaScript runtime)
- **Express.js 4.18.2**
  - Minimal web framework
  - Middleware architecture
  - RESTful routing

### **Database**
- **MongoDB** (NoSQL Document Database)
  - Database Name: `revive-refuel`
  - Cloud/Local deployment compatible
  
- **Mongoose 8.0.3**
  - MongoDB ODM (Object Data Modeling)
  - Schema validation
  - Middleware hooks
  - Query building
  - Population (joins)

### **Authentication & Security**
- **JSON Web Tokens (JWT) 9.0.2**
  - Stateless authentication
  - Token-based authorization
  - Role-based access control (Admin, Driver, Customer)

- **bcryptjs 2.4.3**
  - Password hashing
  - Salt generation
  - Secure credential storage

- **Helmet 7.1.0**
  - HTTP security headers
  - XSS protection
  - CSRF mitigation

- **CORS 2.8.5**
  - Cross-Origin Resource Sharing
  - Configurable origin whitelist

### **Validation**
- **Zod 3.22.4**
  - TypeScript-first schema validation
  - Runtime type checking
  - Request payload validation

### **Payment Processing**
- **Stripe 14.10.0**
  - Payment gateway integration
  - PCI-compliant transactions
  - Webhook support

### **Logging & Monitoring**
- **Morgan 1.10.0**
  - HTTP request logger
  - Development & production formats

### **Environment & Configuration**
- **dotenv 16.3.1**
  - Environment variable management
  - Configuration separation

### **TypeScript Development**
- **tsx 4.7.0**
  - TypeScript execution
  - Hot reload during development
  - Watch mode support

---

## 📁 Project Structure

```
REVIVE Refuel - VENALE/
│
├── backend/                        # Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB connection
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT authentication
│   │   │   └── validate.ts        # Zod validation
│   │   ├── models/
│   │   │   ├── User.ts            # User schema
│   │   │   ├── Venue.ts           # Venue schema
│   │   │   ├── Category.ts        # Category schema
│   │   │   ├── Item.ts            # Menu item schema
│   │   │   ├── Order.ts           # Order schema
│   │   │   └── AddonGroup.ts      # Addon schema
│   │   ├── routes/
│   │   │   ├── auth.ts            # Auth endpoints
│   │   │   ├── menu.ts            # Menu endpoints
│   │   │   ├── orders.ts          # Order endpoints
│   │   │   ├── payments.ts        # Payment endpoints
│   │   │   ├── admin/             # Admin routes
│   │   │   └── driver/            # Driver routes
│   │   ├── scripts/
│   │   │   ├── seed.ts            # Database seeding
│   │   │   ├── menu-data.json     # Menu data
│   │   │   └── update-arabic.py   # Translation script
│   │   ├── utils/
│   │   │   └── order.ts           # Order utilities
│   │   └── server.ts              # Express app entry
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # Next.js Frontend
│   ├── public/
│   │   ├── manifest.json          # PWA manifest
│   │   ├── sw.js                  # Service worker
│   │   └── robots.txt
│   ├── src/
│   │   ├── app/                   # Next.js App Router
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── providers.tsx      # React Query provider
│   │   │   ├── admin/             # Admin portal
│   │   │   │   ├── login/
│   │   │   │   ├── menu/
│   │   │   │   ├── orders/
│   │   │   │   └── settings/
│   │   │   ├── driver/            # Driver portal
│   │   │   │   ├── login/
│   │   │   │   └── orders/
│   │   │   ├── staff/             # Staff portal
│   │   │   │   └── orders/
│   │   │   ├── m/[venueSlug]/     # Customer menu
│   │   │   │   ├── page.tsx
│   │   │   │   ├── c/[categoryKey]/
│   │   │   │   ├── cart/
│   │   │   │   └── checkout/
│   │   │   └── o/[orderId]/       # Order tracking
│   │   ├── components/
│   │   │   ├── BackButton.tsx
│   │   │   ├── CartButton.tsx
│   │   │   ├── CartItemCard.tsx
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── FilterChips.tsx
│   │   │   ├── ItemCard.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── NutritionBadge.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── StatusTimeline.tsx
│   │   │   └── TagBadge.tsx
│   │   ├── lib/
│   │   │   ├── api.ts             # API client & types
│   │   │   ├── constants.ts       # App constants
│   │   │   ├── hooks.ts           # Custom hooks
│   │   │   ├── i18n.ts            # Translations
│   │   │   ├── store.ts           # Zustand stores
│   │   │   ├── utils.ts           # Utilities
│   │   │   └── validation.ts      # Form validation
│   │   └── styles/
│   │       └── globals.css        # Global styles
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── tsconfig.json
│
├── build-staff-apk.sh             # APK build automation
├── capacitor.config.ts            # Capacitor config
├── staff-manifest.json            # Staff PWA manifest
├── BUILD-STAFF-APK.md             # Build documentation
├── PROJECT-SUMMARY.md
├── SETUP.md
└── README.md
```

---

## 🗄️ Database Schema

### **Collections**

#### **venues**
```javascript
{
  slug: String (unique),
  name_en: String,
  name_ar: String,
  currency: String,
  delivery_enabled: Boolean,
  member_discount_percent: Number,
  member_discount_note_en: String,
  member_discount_note_ar: String,
  loyalty_note_en: String,
  loyalty_note_ar: String
}
```

#### **categories**
```javascript
{
  key: String (unique),
  venue_id: ObjectId (ref: venues),
  name_en: String,
  name_ar: String,
  imageUrl: String,
  order: Number
}
```

#### **items**
```javascript
{
  key: String (unique),
  category_id: ObjectId (ref: categories),
  name_en: String,
  name_ar: String,
  price: Number,
  ingredients_en: [String],
  ingredients_ar: [String],
  tags: [String],
  nutrition: {
    calories_kcal: Number,
    protein_g: Number,
    carbs_g: Number,
    fat_g: Number,
    fiber_g: Number,
    micros: [String]
  },
  available: Boolean,
  addon_groups: [String]
}
```

#### **orders**
```javascript
{
  orderNumber: String (unique),
  venue_id: ObjectId,
  currentStatus: Enum [PENDING, CONFIRMED, PREPARING, READY, OUT_FOR_DELIVERY, COMPLETED, CANCELLED],
  customer: {
    name: String,
    phone: String,
    email: String
  },
  fulfillment: {
    type: Enum [PICKUP, DELIVERY],
    address: String,
    notes: String
  },
  items: [{
    itemKey: String,
    name_en: String,
    name_ar: String,
    price: Number,
    qty: Number,
    selectedAddons: [Object]
  }],
  totals: {
    subtotal: Number,
    vat: Number,
    discount: Number,
    deliveryFee: Number,
    total: Number
  },
  payment: {
    method: Enum [COD, CARD],
    status: String,
    stripePaymentIntentId: String
  },
  statusTimeline: [{
    status: String,
    at: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### **users**
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: Enum [ADMIN, DRIVER, CUSTOMER],
  name: String,
  phone: String,
  venue_id: ObjectId,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### **Menu APIs**
- `GET /api/menu/:venueSlug` - Get venue menu with categories & items
- `GET /api/menu/:venueSlug/addons` - Get addon groups

### **Order APIs**
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/staff/list` - Get active orders (staff)
- `PATCH /api/orders/staff/:id/status` - Update order status

### **Authentication APIs**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### **Payment APIs**
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

### **Admin APIs**
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/menu/items/:id` - Update menu item
- `POST /api/admin/menu/items` - Create menu item

### **Driver APIs**
- `GET /api/driver/orders` - Get assigned deliveries
- `PATCH /api/driver/orders/:id/location` - Update delivery location

---

## 🌐 Key Features

### **Customer-Facing**
- ✅ Bilingual menu (English/Arabic with RTL support)
- ✅ Real-time menu browsing with search & filters
- ✅ Nutrition information modals
- ✅ Shopping cart with persistence
- ✅ Checkout with pickup/delivery options
- ✅ Order tracking page
- ✅ Member discount application
- ✅ PWA installation support

### **Staff Portal**
- ✅ Real-time order dashboard
- ✅ Order status management workflow
- ✅ Filter by order status
- ✅ Detailed order view with customer info
- ✅ Bilingual interface
- ✅ Auto-refresh every 10 seconds
- ✅ Mobile-optimized (PWA/APK ready)

### **Admin Portal**
- 🔄 Menu management (CRUD operations)
- 🔄 Order analytics
- 🔄 Settings configuration
- 🔄 User management

### **Driver Portal**
- 🔄 Delivery assignment view
- 🔄 Route navigation
- 🔄 Real-time location updates

---

## 🔐 Security Features

1. **Authentication**
   - JWT token-based auth
   - HttpOnly cookies (production)
   - Role-based access control

2. **Data Protection**
   - bcrypt password hashing (10 rounds)
   - Input validation (Zod schemas)
   - SQL/NoSQL injection prevention (Mongoose)

3. **HTTP Security**
   - Helmet.js security headers
   - CORS policy enforcement
   - XSS protection
   - CSRF tokens (production)

4. **Payment Security**
   - PCI-compliant Stripe integration
   - Webhook signature verification
   - Secure payment intent flow

---

## 📱 Mobile Strategy

### **Progressive Web App (PWA)**
- Web App Manifest
- Service Worker for offline support
- Add to Home Screen capability
- App-like experience

### **Native Android (Capacitor)**
- Capacitor configuration for Android builds
- APK generation scripts
- Deep linking support
- Native device features access

---

## 🌍 Internationalization

### **Languages Supported**
- English (en)
- Arabic (ar)

### **Implementation**
- Custom translation hook (`useTranslation`)
- Nested translation keys
- RTL layout switching
- Database-level bilingual content (name_en/name_ar)
- Dynamic language toggle with persistence

### **Coverage**
- ✅ Menu items (56 items)
- ✅ Categories (7 categories)
- ✅ UI labels and buttons
- ✅ Order statuses
- ✅ Nutrition information
- 🔄 Ingredients (partial)

---

## 🚀 Development & Deployment

### **Development Ports**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`
- MongoDB: `mongodb://localhost:27017` (or Atlas URI)

### **Scripts**
```bash
# Backend
npm run dev        # Development with hot reload
npm run build      # TypeScript compilation
npm run start      # Production server
npm run seed       # Database seeding

# Frontend
npm run dev        # Next.js development server
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint checking
```

### **Environment Variables**

**Backend (.env)**
```
MONGODB_URI=mongodb://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=5001
NODE_ENV=development
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

---

## 📊 Performance Optimizations

1. **Next.js Optimizations**
   - Automatic code splitting
   - Image optimization
   - Font optimization
   - Static generation where possible

2. **React Query Caching**
   - Intelligent cache invalidation
   - Background refetching
   - Stale-while-revalidate

3. **Database**
   - Mongoose indexing on frequently queried fields
   - Projection to limit returned data
   - Connection pooling

4. **Frontend**
   - Lazy loading components
   - TailwindCSS JIT compilation
   - Production build minification

---

## 🛠️ Build Tools & DevOps

- **Package Manager**: npm
- **TypeScript Compiler**: tsc 5.3.3
- **Linting**: ESLint with Next.js config
- **Build System**: Next.js built-in Webpack config
- **CSS Processing**: PostCSS + Autoprefixer
- **Version Control**: Git-ready structure

---

## 📈 Scalability Considerations

1. **Horizontal Scaling**
   - Stateless API design
   - JWT tokens (no session storage)
   - MongoDB replica sets ready

2. **Caching Strategy**
   - React Query client-side caching
   - Potential Redis integration for API caching

3. **CDN Deployment**
   - Static assets via Next.js static export
   - Vercel/Netlify compatible

4. **Database**
   - MongoDB Atlas for cloud scaling
   - Sharding support for high-volume data

---

## 🔮 Future Enhancement Opportunities

- [ ] Real-time order updates (WebSocket/Server-Sent Events)
- [ ] Email/SMS notifications (Twilio, SendGrid)
- [ ] Advanced analytics dashboard
- [ ] Inventory management
- [ ] Customer loyalty program
- [ ] Multi-venue support
- [ ] AI-powered recommendations
- [ ] Voice ordering integration

---

**Documentation Version**: 1.0  
**Last Updated**: December 13, 2025  
**Project Status**: Production-Ready (Core Features Complete)
