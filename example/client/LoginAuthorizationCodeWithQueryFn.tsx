/* eslint-disable no-console */
import { useOAuth2 } from '../../src/components';

type TMyAuthData = {
	access_token: string;
};

const LoginCode = () => {
	const { data, loading, error, getAuth, logout } = useOAuth2<TMyAuthData>({
		authorizeUrl: 'http://localhost:3001/mock-authorize',
		clientId: 'SOME_CLIENT_ID_2',
		redirectUri: `${document.location.origin}/callback`,
		scope: 'SOME_SCOPE',
		responseType: 'code',
		exchangeCodeForTokenQueryFn: async (callbackParameters: { code: string }) => {
			const jsonObject = {
				code: callbackParameters.code,
				someOtherData: 'someOtherData',
			};
			const formBody = [];
			// eslint-disable-next-line no-restricted-syntax, guard-for-in
			for (const key in jsonObject) {
				formBody.push(
					`${encodeURIComponent(key)}=${encodeURIComponent(jsonObject[key as keyof typeof jsonObject])}`
				);
			}
			const response = await fetch(`http://localhost:3001/mock-token-form-data`, {
				method: 'POST',
				body: formBody.join('&'),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
				},
			});
			if (!response.ok) throw new Error('exchangeCodeForTokenQueryFn fail at example');
			const tokenData = await response.json();
			return tokenData;
		},
		onSuccess: (payload) => console.log('Success', payload),
		onError: (error_) => console.log('Error', error_),
	});

	const isLoggedIn = Boolean(data?.access_token); // or whatever...

	let ui = (
		<button type="button" id="authorization-code-queryfn-login" onClick={() => getAuth()}>
			Login with Authorization Code with QueryFn
		</button>
	);

	if (error) {
		ui = <div>Error</div>;
	}

	if (loading) {
		ui = <div id="authorization-code-queryfn-loading">Loading...</div>;
	}

	if (isLoggedIn) {
		ui = (
			<div>
				<pre id="authorization-code-queryfn-data">{JSON.stringify(data)}</pre>
				<button
					id="authorization-code-queryfn-logout"
					type="button"
					onClick={() => logout()}
				>
					Logout
				</button>
			</div>
		);
	}

	return (
		<div style={{ margin: '24px' }}>
			<h2> Login with Authorization Code with QueryFn</h2>
			{ui}
		</div>
	);
};

export default LoginCode;
