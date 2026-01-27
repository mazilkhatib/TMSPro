import { gql } from "@apollo/client";

// Shipment Queries
export const GET_SHIPMENTS = gql`
  query GetShipments(
    $filter: ShipmentFilter
    $page: Int
    $limit: Int
    $sortBy: String
    $sortOrder: SortOrder
  ) {
    shipments(
      filter: $filter
      page: $page
      limit: $limit
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      shipments {
        id
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
          country
        }
        trackingNumber
        status
        priority
        rate
        weight
        estimatedDelivery
        actualDelivery
        flagged
        notes
        createdAt
        updatedAt
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
`;

export const GET_SHIPMENT = gql`
  query GetShipment($id: ID!) {
    shipment(id: $id) {
      id
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
        country
      }
      trackingNumber
      status
      priority
      rate
      weight
      estimatedDelivery
      actualDelivery
      flagged
      notes
      createdBy {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_SHIPMENT_STATS = gql`
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
`;

// User Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      role
      avatar
      isActive
      lastLogin
    }
  }
`;
