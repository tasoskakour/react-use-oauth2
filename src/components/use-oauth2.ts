import { useCallback, useReducer, useRef } from 'react';
import {
	DEFAULT_EXCHANGE_CODE_FOR_TOKEN_METHOD,
	OAUTH_RESPONSE,
	OAUTH_STATE_KEY,
	POPUP_HEIGHT,
	POPUP_WIDTH,
} from './constants';
import { objectToQuery, queryToObject } from './tools';

export type AuthTokenPayload = {
	token_type: string;
	expires_in: number;
	access_token: string;
	scope: string;
	refresh_token: string;
};

export type ResponseTypeBasedProps<TData> =
	| {
			responseType: 'code';
			exchangeCodeForTokenServerURL: string;
			exchangeCodeForTokenMethod?: 'POST' | 'GET';
			onSuccess?: (payload: TData) => void; // TODO as this payload will be custom
			// TODO Adjust payload type
	  }
	| {
			responseType: 'token';
			onSuccess?: (payload: TData) => void; // TODO Adjust payload type
	  };

export type Oauth2Props<TData = AuthTokenPayload> = {
	authorizeUrl: string;
	clientId: string;
	redirectUri: string;
	scope?: string;
	onError?: (error: string) => void;
} & ResponseTypeBasedProps<TData>;

const enhanceAuthorizeUrl = (
	authorizeUrl: string,
	clientId: string,
	redirectUri: string,
	scope: string,
	state: string,
	responseType: Oauth2Props['responseType']
) => {
	return `${authorizeUrl}?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
};

// https://medium.com/@dazcyril/generating-cryptographic-random-state-in-javascript-in-the-browser-c538b3daae50
const generateState = () => {
	const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let array = new Uint8Array(40) as any;
	window.crypto.getRandomValues(array);
	array = array.map((x: number) => validChars.codePointAt(x % validChars.length));
	const randomState = String.fromCharCode.apply(null, array);
	return randomState;
};

const saveState = (state: string) => {
	sessionStorage.setItem(OAUTH_STATE_KEY, state);
};

const removeState = () => {
	sessionStorage.removeItem(OAUTH_STATE_KEY);
};

const openPopup = (url: string) => {
	// To fix issues with window.screen in multi-monitor setups, the easier option is to
	// center the pop-up over the parent window.
	const top = window.outerHeight / 2 + window.screenY - POPUP_HEIGHT / 2;
	const left = window.outerWidth / 2 + window.screenX - POPUP_WIDTH / 2;
	return window.open(
		url,
		'OAuth2 Popup',
		`height=${POPUP_HEIGHT},width=${POPUP_WIDTH},top=${top},left=${left}`
	);
};

const closePopup = (popupRef: React.MutableRefObject<Window | null | undefined>) => {
	popupRef.current?.close();
};

const cleanup = (
	intervalRef: React.MutableRefObject<any>,
	popupRef: React.MutableRefObject<Window | null | undefined>,
	handleMessageListener: any
) => {
	clearInterval(intervalRef.current);
	closePopup(popupRef);
	removeState();
	window.removeEventListener('message', handleMessageListener);
};

export type State<TData = AuthTokenPayload> = {
	data: TData | null;
	loading: boolean;
	error: string | null;
};

const LOGIN = 'LOGIN';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_ERROR = 'LOGIN_ERROR';

export type Action =
	| {
			type: 'LOGIN';
	  }
	| {
			type: 'LOGIN_SUCCESS';
			data: any;
	  }
	| {
			type: 'LOGIN_ERROR';
			error: string;
	  };

const reducer = <TData>(state: State<TData>, action: Action): State<TData> => {
	switch (action.type) {
		case LOGIN:
			return {
				...state,
				loading: true,
				error: null,
			};
		case LOGIN_SUCCESS:
			return {
				...state,
				loading: false,
				data: action.data,
			};

		case LOGIN_ERROR:
			return {
				...state,
				loading: false,
				error: action.error || 'Unknown error occured during logging in.',
			};
		default:
			throw new Error('Unknown action type');
	}
};

const formatExchangeCodeForTokenServerURL = (
	exchangeCodeForTokenServerURL: string,
	clientId: string,
	code: string,
	redirectUri: string
) => {
	const url = exchangeCodeForTokenServerURL.split('?')[0];
	const anySearchParameters = queryToObject(exchangeCodeForTokenServerURL.split('?')[1]);
	return `${url}?${objectToQuery({
		...anySearchParameters,
		client_id: clientId,
		grant_type: 'authorization_code',
		code,
		redirect_uri: redirectUri,
	})}`;
};

const useOauth2 = <TData = AuthTokenPayload>(props: Oauth2Props<TData>) => {
	const {
		authorizeUrl,
		clientId,
		redirectUri,
		scope = '',
		responseType,
		onSuccess,
		onError,
	} = props;

	const popupRef = useRef<Window | null>();
	const intervalRef = useRef<any>();
	const [hookState, dispatch] = useReducer<(state: State<TData>, action: Action) => State<TData>>(
		reducer,
		{
			data: null,
			error: null,
			loading: false,
		}
	);
	const exchangeCodeForTokenServerURL =
		responseType === 'code' && props.exchangeCodeForTokenServerURL;
	const exchangeCodeForTokenMethod = responseType === 'code' && props.exchangeCodeForTokenMethod;

	const getAuth = useCallback(() => {
		// 1. Init
		dispatch({ type: LOGIN });

		// 2. Generate and save state
		const state = generateState();
		saveState(state);

		// 3. Open popup
		popupRef.current = openPopup(
			enhanceAuthorizeUrl(authorizeUrl, clientId, redirectUri, scope, state, responseType)
		);

		// 4. Register message listener
		async function handleMessageListener(message: MessageEvent<any>) {
			try {
				const type = message?.data?.type;
				if (type === OAUTH_RESPONSE) {
					const errorMaybe = message?.data?.error;
					if (errorMaybe) {
						dispatch({ type: 'LOGIN_ERROR', error: errorMaybe });
						if (onError) await onError(errorMaybe);
					} else {
						let payload = message?.data?.payload;
						if (responseType === 'code' && exchangeCodeForTokenServerURL) {
							const response = await fetch(
								formatExchangeCodeForTokenServerURL(
									exchangeCodeForTokenServerURL,
									clientId,
									payload?.code,
									redirectUri
								),
								{
									method:
										exchangeCodeForTokenMethod ||
										DEFAULT_EXCHANGE_CODE_FOR_TOKEN_METHOD,
								}
							);
							payload = await response.json();
						}
						dispatch({ type: 'LOGIN_SUCCESS', data: payload });
						if (onSuccess) {
							await onSuccess(payload);
						}
					}
				}
			} catch (genericError: any) {
				console.error(genericError);
				dispatch({ type: 'LOGIN_ERROR', error: genericError.toString() });
			} finally {
				// Clear stuff ...
				cleanup(intervalRef, popupRef, handleMessageListener);
			}
		}
		window.addEventListener('message', handleMessageListener);

		// 4. Begin interval to check if popup was closed forcefully by the user
		intervalRef.current = setInterval(() => {
			const popupClosed = popupRef.current?.window?.closed;
			if (popupClosed) {
				dispatch({
					type: 'LOGIN_ERROR',
					error: 'Authentication Popup was closed by the user.',
				});
				console.warn('Warning: Popup was closed before authenticating');
				clearInterval(intervalRef.current);
				removeState();
				window.removeEventListener('message', handleMessageListener);
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
		exchangeCodeForTokenServerURL,
		exchangeCodeForTokenMethod,
		onSuccess,
		onError,
		dispatch,
	]);

	return { ...hookState, getAuth };
};

export default useOauth2;
