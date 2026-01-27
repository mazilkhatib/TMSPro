# **TMS Backend Testing Guide**

Complete guide to test the TMS GraphQL API backend with seed data.

---

## **📋 Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Setup & Installation](#setup--installation)
3. [Running the Backend Server](#running-the-backend-server)
4. [Seeding Database](#seeding-database)
5. [Testing with GraphQL Playground](#testing-with-graphql-playground)
6. [Authentication Testing](#authentication-testing)
7. [Testing Queries](#testing-queries)
8. [Testing Mutations](#testing-mutations)
9. [Authorization Testing](#authorization-testing)
10. [Performance Testing](#performance-testing)

---

## **🔧 Prerequisites**

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.0 or higher)
  - Option 1: Install locally - [Download](https://www.mongodb.com/try/download/community)
  - Option 2: Use Docker (recommended)
    ```bash
    docker run -d -p 27017:27017 --name mongodb mongo:latest
    ```
  - Option 3: Use MongoDB Atlas (free cloud tier) - [Sign Up](https://www.mongodb.com/cloud/atlas)

- **npm or yarn** (comes with Node.js)

---

## **🚀 Setup & Installation**

### Step 1: Navigate to Backend Directory

```bash
cd /Users/mazil/Desktop/My\ Projects/TMS/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- `@apollo/server` - GraphQL server
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `graphql` - GraphQL implementation
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- And more...

### Step 3: Configure Environment Variables

The `.env` file is already configured with defaults:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tms

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

**If using MongoDB Atlas**, update `MONGODB_URI`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tms
```

---

## **▶️ Running the Backend Server**

### Development Mode (with hot-reload)

```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB
✅ Apollo Server started

🚀 TMS GraphQL Server is running!

   GraphQL Playground: http://localhost:4000/graphql
   Health Check:       http://localhost:4000/health
```

### Production Mode

```bash
npm run build
npm start
```

### Verify Server is Running

Check health endpoint:
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

---

## **🌱 Seeding Database**

### Run Seed Script

The seed script will:
- Clear existing data
- Create 2 users (admin and employee)
- Create 50 sample shipments with realistic data

```bash
npm run seed
```

Expected output:
```
✅ Connected to MongoDB
🗑️  Cleared existing data
👤 Created users:
   Admin: admin@tms.com / admin123
   Employee: employee@tms.com / employee123
📦 Created 50 shipments

✅ Seeding complete!
```

### Test Users Created

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tms.com | admin123 |
| Employee | employee@tms.com | employee123 |

---

## **🎮 Testing with GraphQL Playground**

### Open GraphQL Playground

1. Open your browser
2. Navigate to: **http://localhost:4000/graphql**
3. You'll see the GraphQL Playground interface

### Playground Features

- **Left Panel**: Write your queries/mutations
- **Middle Panel**: View results
- **Right Panel**: Documentation explorer (schema docs)
- **Bottom Panel**: Query variables

---

## **🔐 Authentication Testing**

### Step 1: Register a New User (Optional)

```graphql
mutation Register {
  register(input: {
    email: "testuser@tms.com"
    password: "test123"
    name: "Test User"
    role: employee
  }) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

### Step 2: Login

**Login as Admin:**
```graphql
mutation AdminLogin {
  login(input: {
    email: "admin@tms.com"
    password: "admin123"
  }) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

**Login as Employee:**
```graphql
mutation EmployeeLogin {
  login(input: {
    email: "employee@tms.com"
    password: "employee123"
  }) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```

**Copy the token from the response!** You'll need it for authenticated requests.

### Step 3: Set Authorization Header

In GraphQL Playground:
1. Click **HTTP Headers** tab at the bottom
2. Add the following:

```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

Example:
```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## **📊 Testing Queries**

### 1. Get Dashboard Statistics

```graphql
query GetShipmentStats {
  shipmentStats {
    total
    pending
    inTransit
    delivered
    cancelled
    flagged
    totalRevenue
  }
}
```

### 2. List All Shipments (Paginated)

```graphql
query ListShipments {
  shipments(page: 1, limit: 10) {
    shipments {
      id
      trackingNumber
      shipperName
      carrierName
      status
      priority
      rate
      estimatedDelivery
    }
    pagination {
      page
      limit
      total
      totalPages
      hasNextPage
      hasPrevPage
    }
  }
}
```

### 3. Filter Shipments by Status

```graphql
query FilterByStatus {
  shipments(
    filter: { status: IN_TRANSIT }
    page: 1
    limit: 5
  ) {
    shipments {
      id
      trackingNumber
      shipperName
      status
      pickupLocation {
        city
        state
      }
      deliveryLocation {
        city
        state
      }
    }
    pagination {
      total
      totalPages
    }
  }
}
```

### 4. Search Shipments

```graphql
query SearchShipments {
  shipments(
    filter: { search: "FedEx" }
    page: 1
    limit: 5
  ) {
    shipments {
      id
      trackingNumber
      carrierName
      status
    }
    pagination {
      total
    }
  }
}
```

### 5. Sort Shipments

```graphql
query SortShipments {
  shipments(
    sortBy: "rate"
    sortOrder: DESC
    page: 1
    limit: 5
  ) {
    shipments {
      id
      trackingNumber
      rate
      shipperName
    }
  }
}
```

### 6. Get Single Shipment Details

```graphql
query GetShipment {
  shipment(id: "SHIPMENT_ID_HERE") {
    id
    trackingNumber
    shipperName
    carrierName
    pickupLocation {
      address
      city
      state
      zip
      country
    }
    deliveryLocation {
      address
      city
      state
      zip
    }
    status
    priority
    rate
    weight
    estimatedDelivery
    actualDelivery
    flagged
    notes
    createdBy {
      name
      email
    }
    createdAt
    updatedAt
  }
}
```

### 7. Get Current User Info

```graphql
query GetCurrentUser {
  me {
    id
    email
    name
    role
    isActive
    lastLogin
    createdAt
  }
}
```

### 8. List All Users (Admin Only)

```graphql
query ListUsers {
  users {
    id
    email
    name
    role
    isActive
    createdAt
  }
}
```

---

## **✏️ Testing Mutations**

### 1. Create a New Shipment

```graphql
mutation CreateShipment {
  createShipment(input: {
    shipperName: "Acme Corp"
    carrierName: "FedEx"
    pickupLocation: {
      address: "123 Main St"
      city: "New York"
      state: "NY"
      zip: "10001"
      country: "USA"
    }
    deliveryLocation: {
      address: "456 Oak Ave"
      city: "Los Angeles"
      state: "CA"
      zip: "90001"
      country: "USA"
    }
    rate: 250.50
    weight: 150.5
    estimatedDelivery: "2025-02-15"
    priority: HIGH
    notes: "Fragile items - handle with care"
  }) {
    id
    trackingNumber
    shipperName
    status
    priority
  }
}
```

### 2. Update a Shipment

```graphql
mutation UpdateShipment {
  updateShipment(
    id: "SHIPMENT_ID_HERE"
    input: {
      status: IN_TRANSIT
      priority: URGENT
      notes: "Updated: Priority shipment - expedite delivery"
    }
  ) {
    id
    status
    priority
    notes
    updatedAt
  }
}
```

### 3. Flag/Unflag a Shipment

**Flag:**
```graphql
mutation FlagShipment {
  flagShipment(id: "SHIPMENT_ID_HERE", flagged: true) {
    id
    flagged
    trackingNumber
  }
}
```

**Unflag:**
```graphql
mutation UnflagShipment {
  flagShipment(id: "SHIPMENT_ID_HERE", flagged: false) {
    id
    flagged
    trackingNumber
  }
}
```

### 4. Delete a Shipment (Admin Only)

```graphql
mutation DeleteShipment {
  deleteShipment(id: "SHIPMENT_ID_HERE")
}
```

---

## **🔒 Authorization Testing**

### Test Admin-Only Features

**Step 1:** Login as Employee and try to delete:

```graphql
mutation TryDeleteAsEmployee {
  deleteShipment(id: "SHIPMENT_ID_HERE")
}
```

**Expected Result:**
```json
{
  "data": {
    "deleteShipment": null
  },
  "errors": [
    {
      "message": "Not authorized: Admin access required",
      "path": ["deleteShipment"]
    }
  ]
}
```

**Step 2:** Login as Admin and try the same:

```graphql
mutation DeleteAsAdmin {
  deleteShipment(id: "SHIPMENT_ID_HERE")
}
```

**Expected Result:**
```json
{
  "data": {
    "deleteShipment": true
  }
}
```

### Test Protected Routes

Try accessing a protected mutation WITHOUT authentication:

```graphql
mutation TryCreateWithoutAuth {
  createShipment(input: {
    shipperName: "Test"
    carrierName: "FedEx"
    pickupLocation: {
      address: "123 Main St"
      city: "New York"
      state: "NY"
      zip: "10001"
      country: "USA"
    }
    deliveryLocation: {
      address: "456 Oak Ave"
      city: "Los Angeles"
      state: "CA"
      zip: "90001"
      country: "USA"
    }
    rate: 100
    weight: 50
    estimatedDelivery: "2025-02-15"
  }) {
    id
  }
}
```

**Expected Result:**
```json
{
  "data": {
    "createShipment": null
  },
  "errors": [
    {
      "message": "Not authorized: Authentication required",
      "path": ["createShipment"]
    }
  ]
}
```

---

## **⚡ Performance Testing**

### 1. Test Pagination Performance

Query large datasets:

```graphql
query PerformanceTest {
  shipments(page: 1, limit: 50) {
    shipments {
      id
      trackingNumber
      status
    }
    pagination {
      total
      totalPages
    }
  }
}
```

**Expected:** Response time < 500ms for 50 records

### 2. Test Complex Filters

```graphql
query ComplexFilter {
  shipments(
    filter: {
      status: IN_TRANSIT
      priority: HIGH
      flagged: true
      search: "FedEx"
    }
    sortBy: "rate"
    sortOrder: ASC
    page: 1
    limit: 10
  ) {
    shipments {
      id
      trackingNumber
      rate
      priority
    }
    pagination {
      total
    }
  }
}
```

**Expected:** Response time < 300ms

### 3. Verify Indexes

Check MongoDB indexes are working:

```bash
# Connect to MongoDB
mongosh

# Switch to database
use tms

# View indexes on shipments collection
db.shipments.getIndexes()

# Expected output should show:
# - _id index
# - trackingNumber (unique)
# - status
# - priority
# - carrierName
# - shipperName
# - createdAt
# - Compound indexes
# - Text index
```

### 4. Test Search Performance

```graphql
query SearchPerformance {
  shipments(
    filter: { search: "shipping" }
    limit: 20
  ) {
    shipments {
      id
      shipperName
      carrierName
      trackingNumber
    }
  }
}
```

**Expected:** Full-text search using text index, response < 200ms

---

## **🐛 Troubleshooting**

### MongoDB Connection Issues

**Error:** `MongoServerError: Authentication failed`

**Solution:**
- If using MongoDB Atlas, ensure your IP is whitelisted
- Check username/password in connection string

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::4000`

**Solution:**
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>
```

### JWT Token Expired

**Error:** `Not authorized: Invalid token`

**Solution:** Login again to get a fresh token

### Import Errors

**Error:** `Cannot find module '@/...'`

**Solution:** Ensure you're running from the `backend` directory

---

## **📝 Testing Checklist**

Use this checklist to ensure all features are working:

- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] Seed script runs successfully
- [ ] Health check endpoint returns 200
- [ ] Can access GraphQL Playground
- [ ] User registration works
- [ ] User login works and returns token
- [ ] Can set authorization header
- [ ] Get current user query works
- [ ] List shipments query works
- [ ] Filter shipments by status works
- [ ] Search shipments works
- [ ] Sort shipments works
- [ ] Pagination works correctly
- [ ] Get single shipment works
- [ ] Create shipment works
- [ ] Update shipment works
- [ ] Flag/unflag shipment works
- [ ] Delete shipment works (admin only)
- [ ] Employee cannot delete shipments
- [ ] Employee cannot access users list
- [ ] Dashboard stats query works
- [ ] All indexes are created in MongoDB
- [ ] Queries return under 500ms

---

## **🔍 Useful MongoDB Commands**

```bash
# Connect to MongoDB
mongosh

# Use database
use tms

# Show all collections
show collections

# Count documents
db.shipments.countDocuments()
db.users.countDocuments()

# View sample shipment
db.shipments.findOne()

# View all users
db.users.find({}, { password: 0 })

# View indexes
db.shipments.getIndexes()

# Check query performance (explain)
db.shipments.find({ status: "IN_TRANSIT" }).explain("executionStats")

# Clear all data
db.shipments.deleteMany({})
db.users.deleteMany({})
```

---

## **📚 Additional Resources**

- **GraphQL Documentation**: https://graphql.org/learn/
- **Apollo Server**: https://www.apollographql.com/docs/apollo-server/
- **MongoDB Documentation**: https://docs.mongodb.com/
- **GraphQL Playground**: https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/

---

## **✅ Next Steps**

After successful testing:

1. **Connect Frontend**: Update frontend to use GraphQL API instead of dummy data
2. **Environment Variables**: Update JWT_SECRET for production
3. **Deployment**: Deploy backend to production (Heroku, AWS, DigitalOcean)
4. **Monitoring**: Add logging and monitoring (e.g., Sentry, DataDog)
5. **CI/CD**: Set up automated testing and deployment

---

**🎉 Happy Testing!**

If you encounter any issues or have questions, refer to the codebase documentation or check the server logs for detailed error messages.
