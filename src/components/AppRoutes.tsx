import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LinearProgress } from '@mui/material';

const Loadable = (props: any) => <Suspense {...props} fallback={<LinearProgress />} />;

const Home = lazy(() => import('./screens/Home'));

const AppRoutes = () => (
	<Routes>
		<Route
			element={
				<Loadable>
					<Home />
				</Loadable>
			}
			path="/"
		/>
	</Routes>
);

export default AppRoutes;
