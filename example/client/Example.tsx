import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { OAuthPopup } from '../../src/components';
import LoginAuthorizationCode from './LoginAuthorizationCode';
import LoginImplicitGrant from './LoginImplicitGrant';

const Home = () => {
	return (
		<div style={{ margin: '24px' }}>
			<LoginAuthorizationCode />
			<LoginImplicitGrant />
		</div>
	);
};

const Example = () => (
	<BrowserRouter>
		<Routes>
			<Route element={<OAuthPopup />} path="/callback" />
			<Route element={<Home />} path="/" />
		</Routes>
	</BrowserRouter>
);

export default Example;
