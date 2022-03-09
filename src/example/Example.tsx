import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { AuthPopup, useOauth2 } from '../components';

// const { REACT_CLIENT_ID, REACT_AUTHORIZE_URL } = process.env;

// if (!REACT_CLIENT_ID || !REACT_AUTHORIZE_URL) {
// 	throw new Error('REACT_CLIENT_ID or REACT_AUTHORIZE_URL are not set!');
// }

const REACT_APP_AUTHORIZE_URL = process.env.REACT_APP_AUTHORIZE_URL as string;
const REACT_APP_CLIENT_ID = process.env.REACT_APP_CLIENT_ID as string;

const Login = () => {
	const { auth, getAuth } = useOauth2({
		authorizeUrl: REACT_APP_AUTHORIZE_URL,
		clientId: REACT_APP_CLIENT_ID,
		redirectUri: `${document.location.origin}/callback`,
		scope: 'profiles.read',
	});
	// testing
	const navigate = useNavigate();

	return (
		<button type="button" onClick={() => getAuth()}>
			Login
		</button>
	);
};

const LoggedIn = () => {
	return <div>You are logged in</div>;
};

const Example = () => (
	<BrowserRouter>
		<Routes>
			<Route element={<AuthPopup />} path="/callback" />
			<Route element={<LoggedIn />} path="/logged-in" />
			<Route element={<Login />} path="/" />
		</Routes>
	</BrowserRouter>
);

export default Example;
