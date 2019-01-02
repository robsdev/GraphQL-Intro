const express = require('express');
const expressGraphQL = require('express-graphql');

const app = express();

const schema = require('./schema/schema.js');

// use(path, requestHandler)
app.use('/graphql', expressGraphQL({
    graphiql: true, // to allow GraphiQL dev tool
    schema: schema
}));

app.listen(2019, () => {
    console.log('Listening');
});