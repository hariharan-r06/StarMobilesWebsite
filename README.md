# 🌟 Star Mobiles

A modern mobile phone shop and service center web application built with React, TypeScript, and Supabase.

## ✨ Features

- 📱 **Product Catalog** - Browse mobile phones and accessories
- 🛒 **Shopping Cart** - Add items to cart (requires login)
- 🔧 **Service Booking** - Book mobile repair services
- 👤 **User Authentication** - Email & Phone login/signup
- 👨‍💼 **Admin Dashboard** - Manage products, bookings, and users
- 🗄️ **Database Integration** - Supabase for real-time data

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/hariharan-r06/StarMobilesFreeLance.git

# Navigate to the project directory
cd star-mobiles-showcase

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Create .env file with your Supabase credentials
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
VITE_API_URL=http://localhost:5000/api
```

### Database Setup

1. Go to Supabase SQL Editor
2. Run the schema from `backend/database/schema.sql`
3. Run sample data from `backend/database/sample_products.sql`

### Running the Application

```bash
# Terminal 1: Start backend server
cd backend
npm run dev

# Terminal 2: Start frontend
npm run dev
```

The app will be available at `http://localhost:8080`

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express** - API framework
- **Supabase** - Database & Auth

## 📁 Project Structure

```
star-mobiles-showcase/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React contexts (Auth, Cart, Products)
│   ├── pages/          # Page components
│   ├── lib/            # Utility libraries
│   └── utils/          # Helper functions
├── backend/
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   ├── config/         # Supabase config
│   └── database/       # SQL schemas
└── public/             # Static assets
```

## 👤 Author

**Hariharan**

## 📄 License

This project is licensed under the MIT License.
