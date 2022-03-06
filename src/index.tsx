import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import ReactGA from 'react-ga';
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';
import App from './components/App';

import * as serviceWorkerRegistration from './service-worker-registration';
import reportWebVitals from './report-web-vitals';

Sentry.init({
	dsn: process.env.REACT_APP_SENTRY_DSN,
	environment: process.env.REACT_APP_SENTRY_ENVIRONMENT || 'production',
	ignoreErrors: ['ResizeObserver loop limit exceeded'], // https://stackoverflow.com/a/50387233
	enabled: process.env.NODE_ENV === 'production',
	integrations: [new Integrations.BrowserTracing()],

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for performance monitoring.
	// We recommend adjusting this value in production
	tracesSampleRate: 1,
});

ReactDOM.render(
	<StrictMode>
		<App />
	</StrictMode>,
	document.querySelector('#root')
);

serviceWorkerRegistration.register();
reportWebVitals(({ id, name, value }) => {
	if (process.env.REACT_APP_GA) {
		ReactGA.event({
			category: 'Web Vitals',
			action: name,
			value: Math.round(name === 'CLS' ? value * 1000 : value),
			label: id,
			nonInteraction: true,
		});
	} else {
		console.warn('GA is not initialized, skipping reporting web vitals...');
	}
});
