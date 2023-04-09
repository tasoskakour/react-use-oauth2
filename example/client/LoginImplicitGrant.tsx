/* eslint-disable no-console */
import { useOAuth2 } from '../../src/components';

const LoginToken = () => {
	const { data, loading, error, getAuth, logout } = useOAuth2({
		authorizeUrl: 'http://localhost:3001/mock-authorize',
		clientId: 'SOME_CLIENT_ID',
		redirectUri: `${document.location.origin}/callback`,
		scope: 'SOME_SCOPE',
		responseType: 'token',
		onSuccess: (payload) => console.log('Success', payload),
		onError: (error_) => console.log('Error', error_),
	});

	const isLoggedIn = Boolean(data?.access_token); // or whatever...

	let ui = (
		<button type="button" id="implicit-grant-login" onClick={() => getAuth()}>
			Login with Implicit Grant (Token)
		</button>
	);

	if (error) {
		ui = <div>Error</div>;
	}

	if (loading) {
		ui = <div id="implicit-grant-loading">Loading...</div>;
	}

	if (isLoggedIn) {
		ui = (
			<div>
				<pre id="implicit-grant-data">{JSON.stringify(data)}</pre>
				<button id="implicit-grant-logout" type="button" onClick={() => logout()}>
					Logout
				</button>
			</div>
		);
	}

	return (
		<div style={{ margin: '24px' }}>
			<h2>Implicit Grant Flow</h2>
			{ui}
		</div>
	);
};

export default LoginToken;
