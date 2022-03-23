

//import the gql tagged template function --  import the gql tagged template function from apollo-server-express
const {gql} = require('apollo-server-express');

//crate the typeDefs
    const typeDefs = gql`
        type Query {
            helloWorld: String
        }
    `;


//export the typeDefs
module.exports = typeDefs;