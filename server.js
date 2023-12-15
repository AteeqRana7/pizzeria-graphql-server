const apollo = require("apollo-server");
const { ApolloServer, gql } = apollo;

const pizzaToppings = [
  { id: 1, topping: "Cheesy" },
  { id: 2, topping: "Capsicum" },
  { id: 3, topping: "Olives" },
  { id: 4, topping: "BBQ Chicken" },
];

const pizzas = [
  {
    id: 1,
    pizza: "Neapolitan Pizza",
    toppings: [pizzaToppings[0], pizzaToppings[2]],
    status: "AVAILABLE",
  },
  {
    id: 2,
    pizza: "Chicago Pizza",
    toppings: [pizzaToppings[0], pizzaToppings[2]],
    status: "COOKING",
  },
  {
    id: 3,
    pizza: "New York-Style Pizza",
    toppings: [pizzaToppings[0]],
    status: "UNAVAILABLE",
  },
  {
    id: 4,
    pizza: "Sicilian Pizza",
    toppings: [pizzaToppings[0], pizzaToppings[2]],
    status: "AVAILABLE",
  },
  {
    id: 5,
    pizza: "Greek Pizza",
    toppings: [pizzaToppings[1], pizzaToppings[2]],
    status: "COOKING",
  },
  {
    id: 6,
    pizza: "California Pizza",
    toppings: [pizzaToppings[0], pizzaToppings[2]],
    status: "UNAVAILABLE",
  },
  {
    id: 7,
    pizza: "Detroit Pizza",
    toppings: [pizzaToppings[3], pizzaToppings[2]],
    status: "COOKING",
  },
  {
    id: 8,
    pizza: "St. Louis Pizza",
    toppings: [pizzaToppings[0], pizzaToppings[1]],
    status: "AVAILABLE",
  },
];

const typeDefs = gql`
  enum PizzaStatus {
    AVAILABLE
    COOKING
    UNAVAILABLE
  }

  type Pizza {
    id: Int!
    pizza: String!
    toppings: [Topping!]!
    status: PizzaStatus!
  }

  type Topping {
    id: Int!
    topping: String!
  }

  input ToppingInput {
    id: Int!
  }

  type Query {
    pizzas(name: String): [Pizza]
    pizza(id: Int): Pizza!
    toppings: [Topping]
  }

  type Mutation {
    createPizza(
      pizza: String!
      toppings: [ToppingInput!]!
      status: PizzaStatus!
    ): Pizza!
    updatePizza(
      id: Int!
      pizza: String
      toppings: [ToppingInput]
      status: PizzaStatus
    ): Pizza!
    deletePizza(id: Int!): Boolean!
  }
`;

const resolvers = {
  Query: {
    pizzas: (parent, args, context) => {
      const { name } = args;
      if (name) {
        return [pizzas.find(({ pizza }) => pizza === name)];
      }
      return pizzas;
    },
    pizza: (parent, args, context) => {
      const { id } = args;
      if (id) {
        return pizzas.find(({ id: pizzaId }) => pizzaId === id);
      }
      return undefined;
    },
    toppings: (parent, args, context) => {
      return pizzaToppings;
    },
  },
  Mutation: {
    createPizza: (parent, args, context) => {
      let { id } = pizzas.reduce((prev, curr) =>
        prev.id > curr.id ? prev : curr
      );
      id = id + 1;

      const { toppings, pizza, status } = args;
      const toppingRecords = toppings.map(({ id }) =>
        pizzaToppings.find(({ id: pizzaToppingId }) => pizzaToppingId === id)
      );
      const data = { id, toppings: toppingRecords, pizza, status };
      pizzas.push(data);
      return data;
    },
    updatePizza: (parent, args, context) => {
      const { id, pizza, toppings, status } = args;
      const index = pizzas.findIndex((pizza) => pizza.id === id);
      const toppingRecords = toppings.map(({ id }) =>
        pizzaToppings.find(({ id: pizzaToppingId }) => pizzaToppingId === id)
      );

      pizzas[index] = { id, toppings: toppingRecords, pizza, status };
      return pizzas[index];
    },
    deletePizza: (parent, args, context) => {
      const { id } = args;
      const index = pizzas.findIndex((pizza) => pizza.id === id);
      if (index === -1) {
        return false;
      }
      pizzas.splice(index, 1);
      return true;
    },
  },
};

const server = new ApolloServer({
  playground: true,
  typeDefs,
  resolvers,
});

server.listen({ port: 8080 }).then(({ url }) => {
  console.log(`Server running at ${url}`);
});
