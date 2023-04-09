/* eslint-disable unicorn/consistent-destructuring */
import { TAuthTokenPayload, TOauth2Props } from './types';

export const useCheckProps = <TData = TAuthTokenPayload>(props: TOauth2Props<TData>) => {
	const {
		authorizeUrl,
		clientId,
		redirectUri,
		// scope = '',
		responseType,
		extraQueryParameters = {},
		onSuccess,
		onError,
	} = props;

	if (!authorizeUrl || !clientId || !redirectUri || !responseType) {
		throw new Error(
			'Missing required props for useOAuth2. Required props are: {authorizeUrl, clientId, redirectUri, responseType}'
		);
	}

	if (responseType === 'code' && !props.exchangeCodeForTokenServerURL) {
		throw new Error(
			'exchangeCodeForTokenServerURL is required for responseType of "code" for useOAuth2.'
		);
	}

	if (
		responseType === 'code' &&
		props.exchangeCodeForTokenMethod &&
		!['POST', 'GET'].includes(props.exchangeCodeForTokenMethod)
	) {
		throw new Error(
			'Invalid exchangeCodeForTokenServerURL value. It can be one of "POST" or "GET".'
		);
	}

	if (typeof extraQueryParameters !== 'object') {
		throw new TypeError('extraQueryParameters must be an object for useOAuth2.');
	}

	if (onSuccess && typeof onSuccess !== 'function') {
		throw new TypeError('onSuccess callback must be a function for useOAuth2.');
	}

	if (onError && typeof onError !== 'function') {
		throw new TypeError('onError callback must be a function for useOAuth2.');
	}
};
