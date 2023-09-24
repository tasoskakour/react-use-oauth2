import { renderHook, act, waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import { useOAuth2 } from './use-oauth2';
import { OAUTH_RESPONSE, OAUTH_STATE_KEY } from './constants';
import {
	openPopup,
	cleanup,
	formatAuthorizeUrl,
	formatExchangeCodeForTokenServerURL,
} from './tools';

const AUTHORIZE_URL = 'http://mockAuthorizeUrl';
const CLIENT_ID = 'mockClientId';
const REDIRECT_URI = 'http://mockRedirectUri';
const SCOPE = 'some-scope';
const EXTRA_QUERY_PARAMETERS = { a: 1, b: 2 };
const EXCHANGE_CODE_FOR_TOKEN_SERVER_URL = 'http://mockExchangeCodeForTokenServerURL';
const EXCHANGE_CODE_FOR_TOKEN_SERVER_HEADERS = {
	Authorization:
		'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
};

jest.mock('./tools', () => {
	const originalModule = jest.requireActual('./tools');
	return {
		...originalModule,
		openPopup: jest.fn(() => ({
			window: { closed: false },
			close: jest.fn(),
			postMessage: jest.fn(),
		})),
		cleanup: jest.fn(),
	};
});

afterAll(() => jest.resetAllMocks());

describe('useOAuth2', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.clearAllTimers();
		localStorage.clear();
	});

	it('For responseType=token, should call onSuccess with payload and set data on successful authorization', async () => {
		const onSuccess = jest.fn();
		const mockPayload = {
			access_token: 'SOME_ACCESS_TOKEN',
			expires_in: 3600,
			refresh_token: 'SOME_REFRESH_TOKEN',
			scope: 'SOME_SCOPE',
			token_type: 'Bearer',
		};

		const { result } = renderHook(() =>
			useOAuth2({
				authorizeUrl: AUTHORIZE_URL,
				clientId: CLIENT_ID,
				redirectUri: REDIRECT_URI,
				responseType: 'token',
				scope: SCOPE,
				extraQueryParameters: EXTRA_QUERY_PARAMETERS,
				onSuccess,
			})
		);
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe(null);
		expect(result.current.data).toBe(null);

		// Trigger auth
		await act(() => result.current.getAuth());
		expect(result.current.loading).toBe(true);

		// Check that a state is generated
		const generatedState = sessionStorage.getItem(OAUTH_STATE_KEY);
		expect(generatedState).toEqual(expect.any(String));

		// Check openPopup fn has been called
		const formattedAuthorizeUrl = formatAuthorizeUrl(
			AUTHORIZE_URL,
			CLIENT_ID,
			REDIRECT_URI,
			'some-scope',
			generatedState as string,
			'token',
			EXTRA_QUERY_PARAMETERS
		);
		expect(openPopup).toHaveBeenCalledWith(formattedAuthorizeUrl);

		// Simulate message from popup
		window.postMessage(
			{
				type: OAUTH_RESPONSE,
				payload: mockPayload,
			},
			'*'
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(null);
			expect(result.current.data).toEqual(mockPayload);
			expect(onSuccess).toHaveBeenCalledWith(mockPayload);
			expect(cleanup).toHaveBeenCalled();
		});
	});

	it('For responseType=code, should exchange code for token and then run onSuccess with payload and set data on successful authorization', async () => {
		const onSuccess = jest.fn();
		const fetchMockPayload = {
			access_token: 'SOME_ACCESS_TOKEN',
			expires_in: 3600,
			refresh_token: 'SOME_REFRESH_TOKEN',
			scope: 'SOME_SCOPE',
			token_type: 'Bearer',
		};

		fetchMock.mockResponseOnce(JSON.stringify(fetchMockPayload), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});

		const { result } = renderHook(() =>
			useOAuth2({
				authorizeUrl: AUTHORIZE_URL,
				clientId: CLIENT_ID,
				redirectUri: REDIRECT_URI,
				responseType: 'code',
				scope: SCOPE,
				exchangeCodeForTokenServerURL: EXCHANGE_CODE_FOR_TOKEN_SERVER_URL,
				exchangeCodeForTokenHeaders: EXCHANGE_CODE_FOR_TOKEN_SERVER_HEADERS,
				extraQueryParameters: EXTRA_QUERY_PARAMETERS,
				onSuccess,
			})
		);
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe(null);
		expect(result.current.data).toBe(null);

		await act(() => result.current.getAuth());
		expect(result.current.loading).toBe(true);

		const generatedState = sessionStorage.getItem(OAUTH_STATE_KEY);
		expect(generatedState).toEqual(expect.any(String));

		const formattedAuthorizeUrl = formatAuthorizeUrl(
			AUTHORIZE_URL,
			CLIENT_ID,
			REDIRECT_URI,
			'some-scope',
			generatedState as string,
			'code',
			EXTRA_QUERY_PARAMETERS
		);
		expect(openPopup).toHaveBeenCalledWith(formattedAuthorizeUrl);

		window.postMessage(
			{
				type: OAUTH_RESPONSE,
				payload: { code: 'some-code' },
			},
			'*'
		);

		await waitFor(() => {
			expect(fetchMock.mock.lastCall).toEqual([
				formatExchangeCodeForTokenServerURL(
					EXCHANGE_CODE_FOR_TOKEN_SERVER_URL,
					CLIENT_ID,
					'some-code',
					REDIRECT_URI,
					generatedState as string
				),
				{
					method: 'POST',
					headers: EXCHANGE_CODE_FOR_TOKEN_SERVER_HEADERS,
				},
			]);
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe(null);
			expect(result.current.data).toEqual(fetchMockPayload);
			expect(onSuccess).toHaveBeenCalledWith(fetchMockPayload);
			expect(cleanup).toHaveBeenCalled();
		});
	});

	it('Should call onError with error message on authorization error', async () => {
		const onError = jest.fn();

		const { result } = renderHook(() =>
			useOAuth2({
				authorizeUrl: AUTHORIZE_URL,
				clientId: CLIENT_ID,
				redirectUri: REDIRECT_URI,
				responseType: 'token',
				scope: SCOPE,
				extraQueryParameters: EXTRA_QUERY_PARAMETERS,
				onError,
			})
		);
		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe(null);
		expect(result.current.data).toBe(null);

		await act(() => result.current.getAuth());
		expect(result.current.loading).toBe(true);

		const generatedState = sessionStorage.getItem(OAUTH_STATE_KEY);
		expect(generatedState).toEqual(expect.any(String));

		const formattedAuthorizeUrl = formatAuthorizeUrl(
			AUTHORIZE_URL,
			CLIENT_ID,
			REDIRECT_URI,
			'some-scope',
			generatedState as string,
			'token',
			EXTRA_QUERY_PARAMETERS
		);
		expect(openPopup).toHaveBeenCalledWith(formattedAuthorizeUrl);

		// Simulate error message from popup
		window.postMessage(
			{
				type: OAUTH_RESPONSE,
				error: 'Ooops',
			},
			'*'
		);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.error).toBe('Ooops');
			expect(result.current.data).toBe(null);
			expect(onError).toHaveBeenCalledWith('Ooops');
			expect(cleanup).toHaveBeenCalled();
		});
	});
});
