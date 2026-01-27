import { gql } from "@apollo/client";

// Auth Mutations
export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
        avatar
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

// Shipment Mutations
export const CREATE_SHIPMENT = gql`
  mutation CreateShipment($input: CreateShipmentInput!) {
    createShipment(input: $input) {
      id
      trackingNumber
      shipperName
      carrierName
      status
      priority
      rate
      weight
      estimatedDelivery
      createdAt
    }
  }
`;

export const UPDATE_SHIPMENT = gql`
  mutation UpdateShipment($id: ID!, $input: UpdateShipmentInput!) {
    updateShipment(id: $id, input: $input) {
      id
      shipperName
      carrierName
      status
      priority
      rate
      weight
      estimatedDelivery
      actualDelivery
      notes
      updatedAt
    }
  }
`;

export const DELETE_SHIPMENT = gql`
  mutation DeleteShipment($id: ID!) {
    deleteShipment(id: $id)
  }
`;

export const FLAG_SHIPMENT = gql`
  mutation FlagShipment($id: ID!, $flagged: Boolean!) {
    flagShipment(id: $id, flagged: $flagged) {
      id
      flagged
    }
  }
`;
