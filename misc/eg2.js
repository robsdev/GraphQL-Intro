// NOT USED
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_JACKPOTS = gql`
  {
    jackpots {
      id
      name
    }
  }`;

const JackpotsMenu = ({ onJackpotSelected }) => (
  <Query query={GET_JACKPOTS}>
    {({ loading, error, data }) => {
      if (loading) return 'Loading...';
      if (error) return `Error! ${error.message}`;

      return (
        <select name="jackpot" onChange={onJackpotSelected}>
          {data.jackpots.map(jackpot => (
            <option key={jackpot.id} value={jackpot.name}>
              {jackpot.name}
            </option>
          ))}
        </select>
      );
    }}
  </Query>
);

// When the Query component mounts, Apollo Client creates an observable for our query.
// Our component subscribes to the result of the query via the Apollo Client cache,
// if this is empty it waits for the server response to enter the cache.
