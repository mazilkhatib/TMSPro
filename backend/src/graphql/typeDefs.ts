export const typeDefs = `#graphql
  # Enums
  enum ShipmentStatus {
    PENDING
    PICKED_UP
    IN_TRANSIT
    OUT_FOR_DELIVERY
    DELIVERED
    CANCELLED
    ON_HOLD
  }

  enum ShipmentPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum SortOrder {
    ASC
    DESC
  }

  enum UserRole {
    admin
    employee
  }

  # Types
  type Location {
    address: String!
    city: String!
    state: String!
    zip: String!
    country: String!
  }

  type Shipment {
    id: ID!
    shipperName: String!
    carrierName: String!
    pickupLocation: Location!
    deliveryLocation: Location!
    trackingNumber: String!
    status: ShipmentStatus!
    priority: ShipmentPriority!
    rate: Float!
    weight: Float!
    estimatedDelivery: String!
    actualDelivery: String
    flagged: Boolean!
    notes: String
    createdBy: User
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    avatar: String
    isActive: Boolean!
    lastLogin: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
    hasNextPage: Boolean!
    hasPrevPage: Boolean!
  }

  type ShipmentConnection {
    shipments: [Shipment!]!
    pagination: PaginationInfo!
  }

  # Input Types
  input LocationInput {
    address: String!
    city: String!
    state: String!
    zip: String!
    country: String = "USA"
  }

  input ShipmentFilter {
    status: ShipmentStatus
    priority: ShipmentPriority
    carrierName: String
    shipperName: String
    flagged: Boolean
    search: String
    dateFrom: String
    dateTo: String
  }

  input CreateShipmentInput {
    shipperName: String!
    carrierName: String!
    pickupLocation: LocationInput!
    deliveryLocation: LocationInput!
    rate: Float!
    weight: Float!
    estimatedDelivery: String!
    priority: ShipmentPriority = MEDIUM
    notes: String
  }

  input UpdateShipmentInput {
    shipperName: String
    carrierName: String
    pickupLocation: LocationInput
    deliveryLocation: LocationInput
    status: ShipmentStatus
    priority: ShipmentPriority
    rate: Float
    weight: Float
    estimatedDelivery: String
    actualDelivery: String
    notes: String
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
    role: UserRole = employee
  }

  input LoginInput {
    email: String!
    password: String!
  }

  # Queries
  type Query {
    # Shipment queries
    shipments(
      filter: ShipmentFilter
      page: Int = 1
      limit: Int = 10
      sortBy: String = "createdAt"
      sortOrder: SortOrder = DESC
    ): ShipmentConnection!

    shipment(id: ID!): Shipment

    # Dashboard stats
    shipmentStats: ShipmentStats!

    # User queries
    me: User
    users: [User!]! @auth(requires: admin)
  }

  type ShipmentStats {
    total: Int!
    pending: Int!
    inTransit: Int!
    delivered: Int!
    cancelled: Int!
    flagged: Int!
    totalRevenue: Float!
  }

  # Mutations
  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Shipment mutations (require authentication)
    createShipment(input: CreateShipmentInput!): Shipment! @auth
    updateShipment(id: ID!, input: UpdateShipmentInput!): Shipment! @auth
    deleteShipment(id: ID!): Boolean! @auth(requires: admin)
    flagShipment(id: ID!, flagged: Boolean!): Shipment! @auth
  }

  # Directives
  directive @auth(requires: UserRole) on FIELD_DEFINITION
`;
