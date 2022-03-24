

//import the gql tagged template function --  import the gql tagged template function from apollo-server-express
const {gql} = require('apollo-server-express');

//crate the typeDefs
    const typeDefs = gql`
        
        type Thought {
            _id: ID
            thoughtText: String    
            createdAt: String
            username: String
            reactionCount: Int 
        }
        type Reaction {
            _id: ID
            reactionBody: String
            createdAt: String
            username: String
        }
        type Query {
            thoughts(username: String): [Thought]
        }
        type Query {
            users: [User]
            user(username: String!): User
            thoughts(username: String): [Thought]
            thought(_id: ID!): Thought
        }
        type User {
            _id: ID
            username: String
            email: String
            friendCount: Int
            thoughts: [Thought]
            friends: [User]
        }
        type Mutation {
            login(email: String!, password: String!,): User   
            addUser(username: String!, email: String!, password: String!): User
        }
    `;   //the ! character in a GraphQL query indicates a required argument. Thus, a user can't be created without a username, email, and password.


//export the typeDefs
module.exports = typeDefs;