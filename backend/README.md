# Star Mobiles Backend API

Backend server for Star Mobiles using Express.js and Supabase.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy the example environment file and update with your Supabase credentials:
```bash
cp .env.example .env
```

Then edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Setup Supabase Database
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and run the contents of `database/schema.sql`
4. This will create all required tables with Row Level Security

### 4. Enable Authentication Providers
In Supabase Dashboard → **Authentication** → **Providers**:

#### Email Provider (Required)
- Enable **Email** provider
- Configure email templates if needed

#### Phone Provider (Optional - for OTP)
- Enable **Phone** provider
- Configure SMS provider (Twilio, MessageBird, etc.)

### 5. Run the Server
```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

Server will start at `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register with email/phone + password | ❌ |
| POST | `/api/auth/login` | Login with email + password | ❌ |
| POST | `/api/auth/login-phone` | Login with phone + password | ❌ |
| POST | `/api/auth/send-otp` | Send OTP to phone | ❌ |
| POST | `/api/auth/verify-otp` | Verify phone OTP | ❌ |
| POST | `/api/auth/forgot-password` | Request password reset email | ❌ |
| POST | `/api/auth/reset-password` | Reset password with token | ✅ |
| POST | `/api/auth/change-password` | Change password (logged in) | ✅ |
| POST | `/api/auth/logout` | Logout current user | ❌ |
| GET | `/api/auth/me` | Get current user profile | ✅ |
| PUT | `/api/auth/profile` | Update user profile | ✅ |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products (with filters) | ❌ |
| GET | `/api/products/:id` | Get single product | ❌ |
| POST | `/api/products` | Create product | ✅ Admin |
| PUT | `/api/products/:id` | Update product | ✅ Admin |
| DELETE | `/api/products/:id` | Delete product | ✅ Admin |

**Query Parameters for GET /api/products:**
- `category` - Filter by category (mobile, accessory)
- `brand` - Filter by brand name
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `featured` - Show featured products only (true/false)

### Bookings (Service Requests)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bookings` | Get bookings (own for users, all for admin) | ✅ |
| POST | `/api/bookings` | Create service booking | ✅ |
| PUT | `/api/bookings/:id` | Update booking status | ✅ Admin |
| DELETE | `/api/bookings/:id` | Delete booking | ✅ |

### Cart

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get cart items | ✅ |
| POST | `/api/cart` | Add item to cart | ✅ |
| PUT | `/api/cart/:id` | Update item quantity | ✅ |
| DELETE | `/api/cart/:id` | Remove item from cart | ✅ |
| DELETE | `/api/cart` | Clear entire cart | ✅ |

---

## 📦 Request/Response Examples

### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "user": { ... },
  "session": { ... }
}
```

### Login with Email
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Login with Phone
```bash
POST /api/auth/login-phone
Content-Type: application/json

{
  "phone": "9876543210",
  "password": "securepassword"
}
```

### Forgot Password
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Protected Request Example
```bash
GET /api/auth/me
Authorization: Bearer <access_token>
```

---

## 🗄️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | Extended user info (linked to auth.users) |
| `products` | Mobile phones and accessories |
| `bookings` | Service repair requests |
| `cart_items` | Shopping cart items |
| `orders` | Order history (for checkout) |

### Row Level Security (RLS)
All tables have RLS enabled:
- **Users**: Can only access their own data
- **Admins**: Full access to all data
- **Products**: Publicly readable, admin-only write

---

## 🔒 Security Features

1. **JWT Authentication**: All protected routes verify Supabase JWT tokens
2. **Row Level Security**: Database-level access control
3. **Admin Middleware**: Separate middleware for admin-only operations
4. **Service Key**: Used only server-side for privileged operations
5. **CORS**: Configured to only allow frontend origin
6. **Environment Variables**: All secrets stored in `.env` (gitignored)

---

## 🛠️ Development

### File Structure
```
backend/
├── .env                    # Environment variables (gitignored)
├── .env.example            # Environment template
├── package.json            # Dependencies
├── server.js               # Main Express server
├── config/
│   └── supabase.js         # Supabase client configuration
├── middleware/
│   └── auth.js             # Auth & admin middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── bookings.js         # Service booking routes
│   ├── products.js         # Product routes
│   └── cart.js             # Cart routes
└── database/
    └── schema.sql          # Supabase database schema
```

### Creating an Admin User
After a user signs up, promote them to admin:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 📝 License

MIT License - Star Mobiles © 2024
