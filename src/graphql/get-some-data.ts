import { gql } from '@apollo/client';

// Adjust this dummy endpoint for your needs :-)
export const GET_SOME_DATA = gql`
	query GetSomeData($input: String) {
		getSomeData(input: $input) {
			whatever
		}
	}
`;
