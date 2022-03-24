const {User, Thought} = require('../models');
const {AuthenticationError} = require('apollo-server-express');


const resolvers = {
    Query: {
        thoughts: async (parent, {username}) => {
            const params = username ? {username} : {};  // use a ternary operator to check if username exists. If it does, we set params to an object with a username key set to that value. If it doesn't, we simply return an empty object.
            return Thought.find(params).sort({createdAt: -1}); //We then pass that object, with or without any data in it, to our .find() method. If there's data, it'll perform a lookup by a specific username. If there's not, it'll simply return every thought.
        },
        thought: async (parent, {_id}) => {
            return Thought.findOne({_id});
        },
        //get all users
        users: async () => {
            return User.find()
            .select('__v -password')
            .populate('friends')
            .populate('thoughts');
        },
        //get user by user name
        user: async (parent, {username}) => {
            return User.findOne({username})
            .select('__v -password')
            .populate('friends')
            .populate('thoughts');
        },
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);   //Here, the Mongoose User model creates a new user in the database with whatever is passed in as the args.
            return user;
        },
        login: async () => {
            const user = await User.findOne({email});

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials')
            }
            return user;
        }
    }
};



module.exports = resolvers;