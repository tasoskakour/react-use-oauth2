import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthPopup, useOauth2 } from '../../src/components';

const REACT_APP_AUTHORIZE_URL = process.env.REACT_APP_AUTHORIZE_URL as string;
const REACT_APP_CLIENT_ID = process.env.REACT_APP_CLIENT_ID as string;

const Home = () => {
	const { data, loading, error, getAuth } = useOauth2({
		authorizeUrl: REACT_APP_AUTHORIZE_URL,
		clientId: REACT_APP_CLIENT_ID,
		redirectUri: `${document.location.origin}/callback`,
		scope: 'profiles.read',
		responseType: 'code',
		exchangeCodeForTokenServerURL: 'http://localhost:3001/token',
		exchangeCodeForTokenMethod: 'POST',
		onSuccess: (payload) => console.log('success', payload),
		onError: (error_) => console.log('ERROR', error_),
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
		<button type="button" onClick={() => getAuth()}>
			Login
		</button>
	);
};

const Example = () => (
	<BrowserRouter>
		<Routes>
			<Route element={<AuthPopup />} path="/callback" />
			<Route element={<Home />} path="/" />
		</Routes>
	</BrowserRouter>
);

export default Example;
