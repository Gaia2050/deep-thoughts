const express = require('express');
//import ApolloServer
const {ApolloServer} = require('apollo-server-express');

//import the typeDefs and resolvers 
const {typeDefs, resolvers} = require('./schemas');
const db = require('./config/connection');
const {authMiddleware} = require('./utils/auth');

const PORT = process.env.PORT || 3001;
const app = express();

const startServer = async () => {
  //create new Apollo server and pass in the schema data
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    // context: ({req}) => req.headers,
    context: authMiddleware
    
  });

  //start the Apollo server
  await server.start();

  // integrate the Apollo server with the express application middleware
  server.applyMiddleware({app});

  //log  where you can go to test your GQL API
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};

// initialize the Apollo server
startServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
