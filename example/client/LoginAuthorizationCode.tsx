/* eslint-disable no-console */
import { useOAuth2 } from '../../src/components';

const LoginCode = () => {
	const { data, loading, error, getAuth } = useOAuth2({
		authorizeUrl: 'http://localhost:3001/mock-authorize',
		clientId: 'SOME_CLIENT_ID',
		redirectUri: `${document.location.origin}/callback`,
		scope: 'SOME_SCOPE',
		responseType: 'code',
		exchangeCodeForTokenServerURL: 'http://localhost:3001/mock-token',
		exchangeCodeForTokenMethod: 'POST',
		onSuccess: (payload) => console.log('Success', payload),
		onError: (error_) => console.log('Error', error_),
	});

	const isLoggedIn = Boolean(data?.access_token); // or whatever...

	if (error) {
		return <div>Error</div>;
	}

	if (loading) {
		return <div id="authorization-code-loading">Loading...</div>;
	}

	if (isLoggedIn) {
		return <pre id="authorization-code-data">{JSON.stringify(data)}</pre>;
	}

	return (
		<button
			style={{ margin: '24px' }}
			type="button"
			id="login-with-authorization-code"
			onClick={() => getAuth()}
		>
			Login with Authorization Code
		</button>
	);
};

export default LoginCode;
