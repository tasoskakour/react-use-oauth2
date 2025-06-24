/* eslint-disable unicorn/consistent-destructuring */
import { EXCHANGE_CODE_FOR_TOKEN_METHODS } from './constants';
import { TAuthTokenPayload, TOauth2Props } from './types';

export const useCheckProps = <TData = TAuthTokenPayload>(props: TOauth2Props<TData>) => {
	const {
		authorizeUrl,
		clientId,
		redirectUri,
		state,
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

	if (
		responseType === 'code' &&
		!props.exchangeCodeForTokenQuery &&
		!props.exchangeCodeForTokenQueryFn
	) {
		throw new Error(
			'Either `exchangeCodeForTokenQuery` or `exchangeCodeForTokenQueryFn` is required for responseType of "code" for useOAuth2.'
		);
	}

	if (
		responseType === 'code' &&
		props.exchangeCodeForTokenQuery &&
		!props.exchangeCodeForTokenQuery.url
	) {
		throw new Error('Value `exchangeCodeForTokenQuery.url` is missing.');
	}

	if (
		responseType === 'code' &&
		props.exchangeCodeForTokenQuery &&
		!['GET', 'POST', 'PUT', 'PATCH'].includes(props.exchangeCodeForTokenQuery.method)
	) {
		throw new Error(
			`Invalid \`exchangeCodeForTokenQuery.method\` value. It can be one of ${EXCHANGE_CODE_FOR_TOKEN_METHODS.join(', ')}.`
		);
	}

	if (typeof extraQueryParameters !== 'object' || extraQueryParameters === null) {
		throw new TypeError('extraQueryParameters must be a plain object for useOAuth2.');
	}

	if (
		state !== undefined &&
		state !== null &&
		(typeof state !== 'object' || Array.isArray(state))
	) {
		throw new TypeError(
			'The `state` prop for useOAuth2 must be a plain JSON object if provided.'
		);
	}

	if (onSuccess && typeof onSuccess !== 'function') {
		throw new TypeError('onSuccess callback must be a function for useOAuth2.');
	}

	if (onError && typeof onError !== 'function') {
		throw new TypeError('onError callback must be a function for useOAuth2.');
	}
};
