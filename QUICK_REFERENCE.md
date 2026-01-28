# **TMS Backend - Quick Reference Guide**

Quick commands and queries for testing the TMS GraphQL API.

---

## **🚀 Quick Start**

```bash
# Navigate to backend
cd /Users/mazil/Desktop/My\ Projects/TMS/backend

# Install dependencies (first time only)
npm install

# Start MongoDB (if using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Seed database
npm run seed

# Start server
npm run dev
```

Server will run at: **http://localhost:4000/graphql**

---

## **👤 Test Users**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tms.com | admin123 |
| Employee | employee@tms.com | employee123 |

---

## **🔐 Authentication**

### Login (Get Token)

```graphql
mutation Login {
  login(input: { email: "admin@tms.com", password: "admin123" }) {
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

### Set Authorization Header

In GraphQL Playground, go to **HTTP Headers** tab:

```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

---

## **📊 Essential Queries**

### Get All Shipments (Paginated)

```graphql
query GetShipments {
  shipments(page: 1, limit: 10) {
    shipments {
      id
      trackingNumber
      shipperName
      carrierName
      status
      priority
      rate
    }
    pagination {
      total
      totalPages
      hasNextPage
    }
  }
}
```

### Filter by Status

```graphql
query FilterShipments {
  shipments(filter: { status: IN_TRANSIT }, limit: 10) {
    shipments {
      id
      trackingNumber
      status
      pickupLocation { city state }
      deliveryLocation { city state }
    }
    pagination { total }
  }
}
```

### Search Shipments

```graphql
query SearchShipments {
  shipments(filter: { search: "FedEx" }, limit: 5) {
    shipments {
      id
      trackingNumber
      carrierName
      shipperName
    }
  }
}
```

### Get Single Shipment

```graphql
query GetShipment {
  shipment(id: "SHIPMENT_ID") {
    id
    trackingNumber
    shipperName
    carrierName
    status
    priority
    rate
    weight
    pickupLocation {
      address
      city
      state
      zip
    }
    deliveryLocation {
      address
      city
      state
      zip
    }
    estimatedDelivery
    notes
  }
}
```

### Dashboard Statistics

```graphql
query GetStats {
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

---

## **✏️ Essential Mutations**

### Create Shipment

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
    }
    deliveryLocation: {
      address: "456 Oak Ave"
      city: "Los Angeles"
      state: "CA"
      zip: "90001"
    }
    rate: 250.50
    weight: 150.5
    estimatedDelivery: "2025-02-15"
    priority: HIGH
  }) {
    id
    trackingNumber
    status
  }
}
```

### Update Shipment

```graphql
mutation UpdateShipment {
  updateShipment(
    id: "SHIPMENT_ID"
    input: {
      status: IN_TRANSIT
      priority: URGENT
    }
  ) {
    id
    status
    priority
  }
}
```

### Flag Shipment

```graphql
mutation FlagShipment {
  flagShipment(id: "SHIPMENT_ID", flagged: true) {
    id
    flagged
  }
}
```

### Delete Shipment (Admin Only)

```graphql
mutation DeleteShipment {
  deleteShipment(id: "SHIPMENT_ID")
}
```

---

## **🎯 Common Test Scenarios**

### Test 1: Pagination

```graphql
query TestPagination {
  # Page 1
  shipments(page: 1, limit: 5) {
    shipments { id trackingNumber }
    pagination { page totalPages hasNextPage }
  }
}
```

### Test 2: Sorting

```graphql
query TestSorting {
  shipments(sortBy: "rate", sortOrder: DESC, limit: 5) {
    shipments { id trackingNumber rate }
  }
}
```

### Test 3: Multiple Filters

```graphql
query TestFilters {
  shipments(
    filter: {
      status: DELIVERED
      priority: HIGH
      carrierName: "FedEx"
    }
    limit: 5
  ) {
    shipments {
      id
      trackingNumber
      carrierName
      status
      priority
    }
  }
}
```

### Test 4: Authorization (Admin vs Employee)

```graphql
# As EMPLOYEE - Should FAIL
mutation TestEmployeeDelete {
  deleteShipment(id: "SHIPMENT_ID")
}

# As ADMIN - Should SUCCEED
mutation TestAdminDelete {
  deleteShipment(id: "SHIPMENT_ID")
}
```

---

## **🛠️ MongoDB Commands**

```bash
# Connect to database
mongosh

# Use TMS database
use tms

# Count shipments
db.shipments.countDocuments()

# View sample data
db.shipments.findOne()

# View all users (without passwords)
db.users.find({}, { password: 0 })

# Check indexes
db.shipments.getIndexes()

# Clear all data
db.shipments.deleteMany({})
db.users.deleteMany({})

# Aggregation example
db.shipments.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

---

## **🔥 Status Values**

- `PENDING` - Shipment created, not yet picked up
- `PICKED_UP` - Carrier has picked up the shipment
- `IN_TRANSIT` - Shipment is in transit
- `OUT_FOR_DELIVERY` - Out for final delivery
- `DELIVERED` - Successfully delivered
- `CANCELLED` - Shipment cancelled
- `ON_HOLD` - Shipment on hold

## **⚡ Priority Values**

- `LOW` - Low priority
- `MEDIUM` - Normal priority (default)
- `HIGH` - High priority
- `URGENT` - Urgent priority (highest)

---

## **🐛 Quick Troubleshooting**

| Issue | Solution |
|-------|----------|
| Port 4000 in use | `lsof -i :4000` then `kill -9 <PID>` |
| MongoDB connection failed | Check MongoDB is running: `mongosh` |
| "Not authorized" error | Set Authorization header with valid token |
| Token expired | Login again to get new token |
| Seed fails | Drop database: `db.dropDatabase()` in mongosh |

---

## **📞 Quick Commands Reference**

```bash
# Start everything
npm run seed && npm run dev

# Just seed
npm run seed

# Just start server
npm run dev

# Build for production
npm run build && npm start

# Check MongoDB
mongosh --eval "use tms; db.shipments.count()"
```

---

## **🎯 URLs**

- GraphQL Playground: http://localhost:4000/graphql
- Health Check: http://localhost:4000/health
- MongoDB Local: mongodb://localhost:27017/tms

---
