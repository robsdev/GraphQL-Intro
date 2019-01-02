// NOT USED
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';

// 1) Create instance of the Apollo Client
const client = new ApolloClient({
  // By default, this client will send queries to the
  //  `/graphql` endpoint on the same host
});

// 2) Provide that client to the root of your React component tree
ReactDOM.render(
    <ApolloProvider client={client}>
        <ReduxRouter />
    </ApolloProvider>,
    document.getElementById('app'),
);

// This <ApolloProvider/> component provides the React Apollo functionality to
// all the other components in the application without passing it explicitly.
// See React 'Context': https://reactjs.org/docs/context.html
