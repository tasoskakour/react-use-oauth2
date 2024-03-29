import { renderHook } from '@testing-library/react';
import { useCheckProps } from './use-check-props';
import { TOauth2Props } from './types';
import { EXCHANGE_CODE_FOR_TOKEN_METHODS } from './constants';

// Silence react-test-library intentional error logs
beforeAll(() => {
	const spy = jest.spyOn(console, 'error');
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	spy.mockImplementation(() => {});
});

afterAll(() => {
	jest.resetAllMocks();
});

describe('useCheckProps', () => {
	test('throws error if required props are missing', () => {
		const props = { responseType: 'token' } as TOauth2Props;
		expect(() => renderHook(() => useCheckProps(props))).toThrow(
			new Error(
				'Missing required props for useOAuth2. Required props are: {authorizeUrl, clientId, redirectUri, responseType}'
			)
		);
	});

	test('throws error if exchangeCodeForTokenQuery or exchangeCodeForTokenQueryFn is missing for responseType of "code"', () => {
		const props = {
			authorizeUrl: 'https://example.com',
			clientId: 'test-client-id',
			redirectUri: 'https://example.com/callback',
			responseType: 'code',
		} as TOauth2Props;
		expect(() => renderHook(() => useCheckProps(props))).toThrow(
			new Error(
				'Either `exchangeCodeForTokenQuery` or `exchangeCodeForTokenQueryFn` is required for responseType of "code" for useOAuth2.'
			)
		);
	});

	test('throws error if invalid exchangeCodeForTokenQuery.method value is provided', () => {
		const props = {
			authorizeUrl: 'https://example.com',
			clientId: 'test-client-id',
			redirectUri: 'https://example.com/callback',
			responseType: 'code',
			exchangeCodeForTokenQuery: {
				url: 'https://some-url',
				method: 'invalid-method',
			},
		} as unknown as TOauth2Props;
		expect(() => renderHook(() => useCheckProps(props))).toThrow(
			new Error(
				`Invalid \`exchangeCodeForTokenQuery.method\` value. It can be one of ${EXCHANGE_CODE_FOR_TOKEN_METHODS.join(', ')}.`
			)
		);
	});

	test('throws error if extraQueryParameters is not an object', () => {
		const props = {
			authorizeUrl: 'https://example.com',
			clientId: 'test-client-id',
			redirectUri: 'https://example.com/callback',
			responseType: 'token',
			extraQueryParameters: 'invalid',
		} as unknown as TOauth2Props;
		expect(() => renderHook(() => useCheckProps(props))).toThrow(
			new TypeError('extraQueryParameters must be an object for useOAuth2.')
		);
	});

	test('throws error if onSuccess callback is not a function', () => {
		const props = {
			authorizeUrl: 'https://example.com',
			clientId: 'test-client-id',
			redirectUri: 'https://example.com/callback',
			responseType: 'token',
			onSuccess: 'invalid-callback',
		} as unknown as TOauth2Props;
		expect(() => renderHook(() => useCheckProps(props))).toThrow(
			new TypeError('onSuccess callback must be a function for useOAuth2.')
		);
	});

	test('throws error if onError callback is not a function', () => {
		const props = {
			authorizeUrl: 'https://example.com',
			clientId: 'test-client-id',
			redirectUri: 'https://example.com/callback',
			responseType: 'token',
			onError: 'invalid-callback',
		} as unknown as TOauth2Props;
		expect(() => renderHook(() => useCheckProps(props))).toThrow(
			new TypeError('onError callback must be a function for useOAuth2.')
		);
	});
});
