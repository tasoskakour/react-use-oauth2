import { Meta, Story } from '@storybook/react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';

import { AuthPopup, useOauth2 } from '../components';

const Login = () => {
	const _ = useOauth2();
	// testing
	const navigate = useNavigate();

	return (
		<button type="button" onClick={() => navigate('/callback')}>
			Login
		</button>
	);
};

const LoggedIn = () => {
	return <div>You are logged in</div>;
};

const Page = () => (
	<MemoryRouter>
		<Routes>
			<Route element={<AuthPopup />} path="/callback" />
			<Route element={<LoggedIn />} path="/logged-in" />
			<Route element={<Login />} path="/" />
		</Routes>
	</MemoryRouter>
);

export default {
	component: Page,
	title: 'Demo',
} as Meta;

const Template: Story<typeof Page> = () => <Page />;
export const LoginFlow = Template.bind({});
