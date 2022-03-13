import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthPopup } from '../../src/components';
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
			<Route element={<AuthPopup />} path="/callback" />
			<Route element={<Home />} path="/" />
		</Routes>
	</BrowserRouter>
);

export default Example;
