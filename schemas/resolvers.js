const { User, Thought } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');


const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('__v -password')
                    .populate('thoughts')
                    .populate('friends');

                return userData;
            }
            throw new AuthenticationError('Not logged in');
        },
        thoughts: async (parent, { username }) => {
            const params = username ? { username } : {};  // use a ternary operator to check if username exists. If it does, we set params to an object with a username key set to that value. If it doesn't, we simply return an empty object.
            return Thought.find(params).sort({ createdAt: -1 }); //We then pass that object, with or without any data in it, to our .find() method. If there's data, it'll perform a lookup by a specific username. If there's not, it'll simply return every thought.
        },
        thought: async (parent, { _id }) => {
            return Thought.findOne({ _id });
        },
        //get all users
        users: async () => {
            return User.find()
                .select('__v -password')
                .populate('friends')
                .populate('thoughts');
        },
        //get user by user name
        user: async (parent, { username }) => {
            return User.findOne({ username })
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
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials')
            }

            const token = signToken(user);
            return { token, user };
        },
        addThought: async (parent, args, context) => {    //Only logged-in users should be able to use this mutation, hence why we check for the existence of context.user first. Remember, the decoded JWT is only added to context if the verification passes. The token includes the user's username, email, and _id properties, which become properties of context.user and can be used in the follow-up Thought.create() and User.findByIdAndUpdate() methods.
            if (context.user) {
                const thought = await Thought.create({ ...args, username: context.user.username });

                await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { thoughts: thought._id } },
                    { new: true }  //without the { new: true } flag in User.findByIdAndUpdate(), Mongo would return the original document instead of the updated document.
                );

                return thought;
            }

            throw new AuthenticationError('You need to be logged in');
        },
        addReaction: async (parent, { thoughtId, reactionBody }, context) => {
            if (context.user) {
                const updatedThought = await Thought.findOneAndUpdate(
                    { _id: thoughtId },
                    { $push: { reactions: { reactionBody, username: context.user.username } } },
                    { new: true, runValidators: true }
                );

                return updatedThought;
            }

            throw new AuthenticationError('You need to be logged in')
        },
        addFriend: async (parent, {friendId}, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user.id}, 
                    {$addToSet: {friends: friendId}},
                    {new: true}
                ).populate('friends')

                return updatedUser;s
            }

            throw new AuthenticationError('You need to be logged in!');
        }
    }
};



module.exports = resolvers;