import { useOauth2 } from '../../src/components';

const LoginToken = () => {
	const { data, loading, error, getAuth } = useOauth2({
		authorizeUrl: 'http://localhost:3001/mock-authorize',
		clientId: 'SOME_CLIENT_ID',
		redirectUri: `${document.location.origin}/callback`,
		scope: 'SOME_SCOPE',
		responseType: 'token',
		onSuccess: (payload) => console.log('Success', payload),
		onError: (error_) => console.log('Error', error_),
	});

	const isLoggedIn = Boolean(data?.access_token); // or whatever...

	if (error) {
		return <div>Error</div>;
	}

	if (loading) {
		return <div id="implicit-grant-loading">Loading...</div>;
	}

	if (isLoggedIn) {
		return <pre id="implicit-grant-data">{JSON.stringify(data)}</pre>;
	}

	return (
		<button
			style={{ margin: '24px' }}
			type="button"
			id="login-with-implicit-grant"
			onClick={() => getAuth()}
		>
			Login with Implicit Grant (Token)
		</button>
	);
};

export default LoginToken;
