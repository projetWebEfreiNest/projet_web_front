import { gql } from "urql";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password)
  }
`;

export const REGISTER_MUTATION = gql`
  mutation CreateUser($createUserInput: CreateAuthInput!) {
    createUser(createUserInput: $createUserInput) {
      access_token
    }
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser($id: Int!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

export const GET_USERS_QUERY = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    name
    email
  }
`;
