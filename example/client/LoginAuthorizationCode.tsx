import { useOauth2 } from '../../src/components';

const REACT_APP_AUTHORIZE_URL = process.env.REACT_APP_AUTHORIZE_URL as string;
const REACT_APP_CLIENT_ID = process.env.REACT_APP_CLIENT_ID as string;
const REACT_APP_SCOPE = process.env.REACT_APP_SCOPE as string;

const LoginCode = () => {
	const { data, loading, error, getAuth } = useOauth2({
		authorizeUrl: REACT_APP_AUTHORIZE_URL,
		clientId: REACT_APP_CLIENT_ID,
		redirectUri: `${document.location.origin}/callback`,
		scope: REACT_APP_SCOPE,
		responseType: 'code',
		exchangeCodeForTokenServerURL: 'http://localhost:3001/token',
		exchangeCodeForTokenMethod: 'POST',
		onSuccess: (payload) => console.log('Success', payload),
		onError: (error_) => console.log('Error', error_),
	});

	const isLoggedIn = Boolean(data?.access_token); // or whatever...

	if (error) {
		return <div>Error</div>;
	}

	if (loading) {
		return <div>Loading...</div>;
	}

	if (isLoggedIn) {
		return <pre>{JSON.stringify(data)}</pre>;
	}

	return (
		<button style={{ margin: '24px' }} type="button" onClick={() => getAuth()}>
			Login with Authorization Code
		</button>
	);
};

export default LoginCode;
