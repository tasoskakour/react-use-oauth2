/* eslint-disable no-console */
import { useOAuth2 } from '../../src/components';

const LoginCode = () => {
	const { data, loading, error, getAuth, logout } = useOAuth2({
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

	let ui = (
		<button type="button" id="authorization-code-login" onClick={() => getAuth()}>
			Login with Authorization Code
		</button>
	);

	if (error) {
		ui = <div>Error</div>;
	}

	if (loading) {
		ui = <div id="authorization-code-loading">Loading...</div>;
	}

	if (isLoggedIn) {
		ui = (
			<div>
				<pre id="authorization-code-data">{JSON.stringify(data)}</pre>
				<button id="authorization-code-logout" type="button" onClick={() => logout()}>
					Logout
				</button>
			</div>
		);
	}

	return (
		<div style={{ margin: '24px' }}>
			<h2>Authorization Code Flow</h2>
			{ui}
		</div>
	);
};

export default LoginCode;
