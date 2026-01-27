# Transportation Management System (TMS)

A full-stack TMS application built with Next.js, shadcn/ui, Node.js, GraphQL, and MongoDB.

## 🚀 Features

### Frontend
- **Modern UI** with shadcn/ui components and Tailwind CSS
- **Dark/Light theme** toggle
- **Animated hamburger menu** with single-level submenus
- **Horizontal navigation** bar
- **Grid & Tile views** for shipment data
- **Detail modal** with full shipment information
- **Responsive design** for all screen sizes

### Backend
- **GraphQL API** with Apollo Server
- **MongoDB** database with Mongoose ODM
- **JWT Authentication**
- **Role-based access control** (admin/employee)
- **Pagination, filtering, and sorting**
- **Performance optimizations** (DataLoader, indexes)

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure Environment Variables

Edit `backend/.env`:
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/tms
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin user**: admin@tms.com / admin123
- **Employee user**: employee@tms.com / employee123  
- **50 sample shipments**

## 🏃‍♂️ Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Server runs at http://localhost:4000/graphql

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
App runs at http://localhost:3000

## 📊 GraphQL API

### Queries
- `shipments(filter, page, limit, sortBy, sortOrder)` - Paginated shipments list
- `shipment(id)` - Single shipment details
- `shipmentStats` - Dashboard statistics
- `me` - Current authenticated user
- `users` - All users (admin only)

### Mutations
- `register(input)` - Create new account
- `login(input)` - Authenticate user
- `createShipment(input)` - Create shipment (authenticated)
- `updateShipment(id, input)` - Update shipment (authenticated)
- `deleteShipment(id)` - Delete shipment (admin only)
- `flagShipment(id, flagged)` - Flag/unflag shipment (authenticated)

## 🔐 Role-Based Access

| Feature | Admin | Employee |
|---------|-------|----------|
| View Shipments | ✅ | ✅ |
| Create Shipment | ✅ | ✅ |
| Update Shipment | ✅ | ✅ |
| Flag Shipment | ✅ | ✅ |
| Delete Shipment | ✅ | ❌ |
| View All Users | ✅ | ❌ |

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, shadcn/ui, Tailwind CSS, Apollo Client, Framer Motion |
| Backend | Node.js, Express, Apollo Server, TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT with bcrypt |

## 📁 Project Structure

```
TMS/
├── frontend/
│   └── src/
│       ├── app/              # Next.js app router
│       ├── components/       # React components
│       │   ├── layout/       # Navigation components
│       │   ├── shipments/    # Shipment views
│       │   └── ui/           # shadcn/ui components
│       ├── graphql/          # Queries & mutations
│       ├── lib/              # Utilities
│       └── types/            # TypeScript types
├── backend/
│   └── src/
│       ├── graphql/          # Schema & resolvers
│       ├── models/           # Mongoose models  
│       ├── middleware/       # Auth middleware
│       └── utils/            # DataLoader, helpers
└── README.md
```
