const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLBoolean
} = graphql;

// Define GraphQL object-types, with name and typed fields
const JackpotType = new GraphQLObjectType({
    name: "Jackpot",
    fields: () => ({
        id: { type: new GraphQLNonNull( GraphQLString ) },
        name: { type: new GraphQLNonNull( GraphQLString ) },
        events: {
            type: new GraphQLNonNull( new GraphQLList( new GraphQLNonNull( EventType ) ) ),
            resolve(parentValue, args) {
                // Fetch all the events attached to the current Jackpot
                return axios.get(`http://localhost:3000/jackpots/${parentValue.id}`)
                            .then(response => {
                                let url = '';
                                response.data.events.forEach(eventID => {
                                    url += 'id' + "=" + eventID + "&";
                                });
                                url = url.trim("&");
                                return url;
                            })
                            .then(eventIDs => axios.get(`http://localhost:3000/events?${eventIDs}`)
                                                    .then(response => response.data));
            }
        }
    })
});

const EventType = new GraphQLObjectType({
    name: 'Event',
    fields: () => ({
        id: { type: new GraphQLNonNull( GraphQLString ) },
        name:  { type: new GraphQLNonNull( GraphQLString ) },
        description: { type: GraphQLString },
        gameVariation: { type: new GraphQLNonNull( GraphQLString ) },
        game: { type: new GraphQLNonNull( GraphQLString ) }
    })
});

// Need ROOT QUERY, i.e. an entry-point into application's data graph
const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        // if you ask for 'jackpot', providing a string id,
        // GraphQL will return a response of JackpotType
        jackpot: {
            type: JackpotType,
            args: { id: { type: new GraphQLNonNull( GraphQLString ) } },
            // Fetch from an API end-point
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/jackpots/${args.id}`)
                            .then(response => response.data)

            }
        },

        jackpots: {
            type: GraphQLList(JackpotType),
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/jackpots`)
                            .then(response => response.data)
            }
        },

        event: {
            type: EventType,
            args: { id: { type: new GraphQLNonNull(GraphQLString) } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/events/${args.id}`)
                            .then(response => response.data);
            }
        },

        events: {
            type: GraphQLList(EventType),
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/events`)
                            .then(response => response.data)
            }
        },
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    // Define every mutation within the FIELDS section
    fields: {
        addJackpot: {
            // The TYPE of data eventually RETURNED! (may differ to type we were changing)
            type: JackpotType,
            args: {
                // what the NEW JACKPOT will need
                // WRAP required args with GraphQLNonNull
                name: { type: new GraphQLNonNull( GraphQLString ) },
                events: { type: new GraphQLNonNull( GraphQLList( new GraphQLNonNull( GraphQLString ) ) ) }
            },
            resolve(parentVal, {name, events}) {
                return axios.post('http://localhost:3000/jackpots', {name, events})
                            .then(response => response.data);
            }
        },

        deleteJackpot: {
            // Return type: confirms the entity was deleted
            type: GraphQLBoolean,
            // Need unique ID to delete
            args: { id: { type: new GraphQLNonNull( GraphQLString ) } },
            // Destructure {id} from args for resolve()
            resolve(parentVal, {id}) {
                return axios.delete(`http://localhost:3000/jackpots/${id}`)
                            .then(response => {
                                return response.data.id === undefined;
                            });
            }

        },
        editJackpot: {
            type: JackpotType,
            args: {
                id: { type: new GraphQLNonNull( GraphQLString ) },
                name: { type: GraphQLString },
                events: { type: GraphQLList( GraphQLString ) }
            },
            resolve(parentValue, args) {
                const {id, ...others} = args;
                return axios.patch(`http://localhost:3000/jackpots/${id}`, {...others})
                            .then(response => response.data);
            }
        }
    }
});

// Define the GraphQL schema. GraphQLSchema takes a root query and returns a schema instance
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});