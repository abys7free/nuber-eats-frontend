import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  makeVar,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { LOCALSTORAGE_TOKEN } from "./constants";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

const token = localStorage.getItem(LOCALSTORAGE_TOKEN);


const address = localStorage.getItem('user-address')
const addressDetail = localStorage.getItem('user-addressDetail')


export const isLoggedInVar = makeVar(Boolean(token));
export const authTokenVar = makeVar(token);
export const addressVar = makeVar(address || '');
export const addressDetailVar = makeVar(addressDetail || '');
export const orderLatLngVar = makeVar<{lat:number, lng:number}>({
  lat: 0,
  lng: 0,
});


const wsLink = new WebSocketLink({
  uri:
    process.env.NODE_ENV === "production"
      ? "wss://nomad-nuber-eats-backend.herokuapp.com/graphql"
      : `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
    connectionParams: {
      "x-jwt": authTokenVar() || "",
    },
  },
});

const httpLink = createHttpLink({
  uri:
    process.env.NODE_ENV === "production"
      ? "https://nomad-nuber-eats-backend.herokuapp.com/graphql"
      : "http://localhost:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "x-jwt": authTokenVar() || "",
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          isLoggedIn: {
            read() {
              return isLoggedInVar(); // Boolean(localStorage.getItem("token"))
            },
          },
          token: {
            read() {
              return authTokenVar();
            },
          },
          address: {
            read() {
              return addressVar();
            },
          },
          addressDetail: {
            read() {
              return addressDetailVar();
            },
          },
          orderLatLng: {
            read() {
              return orderLatLngVar();
            },
          },
        },
      },
    },
  }),
});
