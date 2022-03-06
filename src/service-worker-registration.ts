/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const isLocalhost = Boolean(
	window.location.hostname === 'localhost' ||
		window.location.hostname === '[::1]' ||
		/^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})){3}$/.test(window.location.hostname)
);

function registerValidSW(swUrl: string, config: any) {
	navigator.serviceWorker
		.register(swUrl)
		.then((registration) => {
			registration.addEventListener('updatefound', () => {
				const installingWorker = registration.installing;
				if (installingWorker == null) {
					return;
				}
				installingWorker.addEventListener('statechange', () => {
					if (installingWorker.state === 'installed') {
						if (navigator.serviceWorker.controller) {
							console.log(
								'New content is available and will be used when all tabs for this page are closed. See https://bit.ly/CRA-PWA.'
							);
							if (config && config.onUpdate) config.onUpdate(registration);
						} else {
							console.log('Content is cached for offline use.');
							if (config && config.onSuccess) config.onSuccess(registration);
						}
					}
				});
			});
		})
		.catch((error) => console.error('Error during service worker registration:', error));
}

function checkValidServiceWorker(swUrl: string, config: any) {
	fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
		.then((response) => {
			const contentType = response.headers.get('content-type');
			if (
				response.status === 404 ||
				(contentType != null && !contentType.includes('javascript'))
			) {
				navigator.serviceWorker.ready.then((registration) =>
					registration.unregister().then(() => window.location.reload())
				);
			} else {
				registerValidSW(swUrl, config);
			}
		})
		.catch(() => console.log('No internet connection found. App is running in offline mode.'));
}

export function register(config?: any) {
	if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
		const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
		if (publicUrl.origin !== window.location.origin) return;

		window.addEventListener('load', () => {
			const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

			if (isLocalhost) {
				checkValidServiceWorker(swUrl, config);
				navigator.serviceWorker.ready.then(() => {
					console.log(
						'This web app is being served cache-first by a service worker. To learn more, visit https://bit.ly/CRA-PWA'
					);
				});
			} else {
				registerValidSW(swUrl, config);
			}
		});
	}
}

export function unregister() {
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.ready
			.then((registration) => registration.unregister())
			.catch((error) => console.error(error.message));
	}
}
