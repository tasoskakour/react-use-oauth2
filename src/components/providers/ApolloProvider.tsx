import {
	ApolloProvider,
	ApolloClient,
	InMemoryCache,
	createHttpLink,
	ApolloLink,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({ uri: process.env.REACT_APP_GRAPHQL_HTTP_URI });

const errorLink = onError(({ graphQLErrors, networkError }) => {
	if (graphQLErrors) {
		graphQLErrors.map(({ message, locations, path }) =>
			console.error(
				`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
			)
		);
	}
	if (networkError) console.error(`[Network error]: ${networkError}`);
});

const client = new ApolloClient({
	link: ApolloLink.from([errorLink, httpLink]),
	cache: new InMemoryCache(),
});

const AppApolloprovider = ({ children }: { children: React.ReactNode }) => (
	<ApolloProvider client={client}>{children}</ApolloProvider>
);

export default AppApolloprovider;
