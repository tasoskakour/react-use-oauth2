import { useEffect } from 'react';
import ReactGA from 'react-ga';
import { useLocation } from 'react-router-dom';

let initialized = false;
if (process.env.REACT_APP_GA) {
	ReactGA.initialize(process.env.REACT_APP_GA, {
		testMode: process.env.NODE_ENV !== 'production',
	});
	initialized = true;
} else {
	console.warn('REACT_APP_GA variable not given, aborting GA initialization...');
}

const GaProvider = ({ children }: { children: JSX.Element }) => {
	const { pathname } = useLocation();

	useEffect(() => {
		ReactGA.set({ page: pathname, anonymizeIp: true });
		ReactGA.pageview(pathname);
	}, [pathname]);

	return children;
};

const Wrapper = (props: any) => {
	const { children } = props;

	if (initialized) {
		return <GaProvider {...props} />;
	}

	return children;
};

export default Wrapper;
