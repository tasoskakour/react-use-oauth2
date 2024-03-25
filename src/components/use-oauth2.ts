import { useCallback, useRef, useState } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { DEFAULT_EXCHANGE_CODE_FOR_TOKEN_METHOD, OAUTH_RESPONSE } from './constants';
import {
	cleanup,
	formatAuthorizeUrl,
	formatExchangeCodeForTokenServerURL,
	generateState,
	openPopup,
	saveState,
} from './tools';
import { TAuthTokenPayload, TMessageData, TOauth2Props, TState } from './types';
import { useCheckProps } from './use-check-props';

export const useOAuth2 = <TData = TAuthTokenPayload>(props: TOauth2Props<TData>) => {
	const {
		authorizeUrl,
		clientId,
		redirectUri,
		scope = '',
		responseType,
		extraQueryParameters = {},
		onSuccess,
		onError,
	} = props;

	useCheckProps<TData>(props);
	const extraQueryParametersRef = useRef(extraQueryParameters);
	const popupRef = useRef<Window | null>();
	const intervalRef = useRef<string | number | NodeJS.Timeout | undefined>();
	const exchangeCodeForTokenQueryRef = useRef(
		responseType === 'code' && props.exchangeCodeForTokenQuery
	);
	const exchangeCodeForTokenQueryFnRef = useRef(
		responseType === 'code' && props.exchangeCodeForTokenQueryFn
	);
	const [{ loading, error }, setUI] = useState<{ loading: boolean; error: string | null }>({
		loading: false,
		error: null,
	});
	const [data, setData, { removeItem, isPersistent }] = useLocalStorageState<TState<TData>>(
		`${responseType}-${authorizeUrl}-${clientId}-${scope}`,
		{
			defaultValue: null,
		}
	);

	const getAuth = useCallback(() => {
		// 1. Init
		setUI({
			loading: true,
			error: null,
		});

		// 2. Generate and save state
		const state = generateState();
		saveState(sessionStorage, state);

		// 3. Open popup
		popupRef.current = openPopup(
			formatAuthorizeUrl(
				authorizeUrl,
				clientId,
				redirectUri,
				scope,
				state,
				responseType,
				extraQueryParametersRef.current
			)
		);

		// 4. Register message listener
		async function handleMessageListener(message: MessageEvent<TMessageData>) {
			const type = message?.data?.type;
			if (type !== OAUTH_RESPONSE) {
				return;
			}
			try {
				if ('error' in message.data) {
					const errorMessage = message.data?.error || 'Unknown Error occured.';
					setUI({
						loading: false,
						error: errorMessage,
					});
					if (onError) await onError(errorMessage);
				} else {
					let payload = message?.data?.payload;

					if (responseType === 'code') {
						const exchangeCodeForTokenQueryFn = exchangeCodeForTokenQueryFnRef.current;
						const exchangeCodeForTokenQuery = exchangeCodeForTokenQueryRef.current;
						if (
							exchangeCodeForTokenQueryFn &&
							typeof exchangeCodeForTokenQueryFn === 'function'
						) {
							payload = await exchangeCodeForTokenQueryFn(message.data?.payload);
						} else if (exchangeCodeForTokenQuery) {
							const response = await fetch(
								formatExchangeCodeForTokenServerURL(
									exchangeCodeForTokenQuery.url,
									clientId,
									payload?.code,
									redirectUri,
									state
								),
								{
									method:
										exchangeCodeForTokenQuery.method ??
										DEFAULT_EXCHANGE_CODE_FOR_TOKEN_METHOD,
									headers: exchangeCodeForTokenQuery.headers || {},
								}
							);
							payload = await response.json();
						} else {
							throw new Error(
								'useOAuth2: You must provide `exchangeCodeForTokenQuery` or `exchangeCodeForTokenQueryFn`'
							);
						}
					}

					setUI({
						loading: false,
						error: null,
					});
					setData(payload);
					if (onSuccess) {
						await onSuccess(payload);
					}
				}
			} catch (genericError: any) {
				console.error(genericError);
				setUI({
					loading: false,
					error: genericError.toString(),
				});
				if (onError) await onError(genericError.toString());
			} finally {
				// Clear stuff ...
				cleanup(intervalRef, popupRef, handleMessageListener);
			}
		}
		window.addEventListener('message', handleMessageListener);

		// 4. Begin interval to check if popup was closed forcefully by the user
		intervalRef.current = setInterval(() => {
			const popupClosed = !popupRef.current?.window || popupRef.current?.window?.closed;
			if (popupClosed) {
				// Popup was closed before completing auth...
				setUI((ui) => ({
					...ui,
					loading: false,
				}));
				console.warn('Warning: Popup was closed before completing authentication.');
				cleanup(intervalRef, popupRef, handleMessageListener);
			}
		}, 250);

		// 5. Remove listener(s) on unmount
		return () => {
			window.removeEventListener('message', handleMessageListener);
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [
		authorizeUrl,
		clientId,
		redirectUri,
		scope,
		responseType,
		onSuccess,
		onError,
		setUI,
		setData,
	]);

	const logout = useCallback(() => {
		removeItem();
		setUI({ loading: false, error: null });
	}, [removeItem]);

	return { data, loading, error, getAuth, logout, isPersistent };
};
