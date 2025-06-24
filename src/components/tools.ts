import { OAUTH_STATE_KEY, POPUP_HEIGHT, POPUP_WIDTH } from './constants';
import { TMessageData, TOauth2Props } from './types';

export const objectToQuery = (object: Record<string, string>) => {
	return new URLSearchParams(object).toString();
};

export const queryToObject = (query: string) => {
	const parameters = new URLSearchParams(query);
	return Object.fromEntries(parameters.entries());
};

export const formatAuthorizeUrl = (
	authorizeUrl: string,
	clientId: string,
	redirectUri: string,
	scope: string,
	state: string,
	responseType: TOauth2Props['responseType'],
	extraQueryParameters: TOauth2Props['extraQueryParameters'] = {}
) => {
	const query = objectToQuery({
		response_type: responseType,
		client_id: clientId,
		redirect_uri: redirectUri,
		scope,
		state,
		...extraQueryParameters,
	});

	return `${authorizeUrl}?${query}`;
};

// https://medium.com/@dazcyril/generating-cryptographic-random-state-in-javascript-in-the-browser-c538b3daae50
export const generateState = (customStateString?: string | undefined) => {
	const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let array = new Uint8Array(40) as any;
	window.crypto.getRandomValues(array);
	array = array.map((x: number) => validChars.codePointAt(x % validChars.length));
	const randomKey = String.fromCharCode.apply(null, array);
	try {
		return JSON.stringify({ [randomKey]: JSON.parse(customStateString ?? '{}') });
	} catch {
		return JSON.stringify({ [randomKey]: {} });
	}
};

export const saveState = (storage: Storage, state: string) => {
	storage.setItem(OAUTH_STATE_KEY, state);
};

export const removeState = (storage: Storage) => {
	storage.removeItem(OAUTH_STATE_KEY);
};

export const checkState = (storage: Storage, receivedState: string) => {
	const state = storage.getItem(OAUTH_STATE_KEY);
	return state === receivedState;
};

export const openPopup = (url: string) => {
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

export const closePopup = (popupRef: React.MutableRefObject<Window | null | undefined>) => {
	popupRef.current?.close();
};

export const isWindowOpener = (opener: Window | null): opener is Window =>
	opener !== null && opener !== undefined;

export const openerPostMessage = (opener: Window, message: TMessageData) =>
	opener.postMessage(message);

export const cleanup = (
	intervalRef: React.MutableRefObject<string | number | NodeJS.Timeout | undefined>,
	popupRef: React.MutableRefObject<Window | null | undefined>,
	handleMessageListener: any
) => {
	clearInterval(intervalRef.current);
	if (popupRef.current && typeof popupRef.current.close === 'function') closePopup(popupRef);
	removeState(sessionStorage);
	window.removeEventListener('message', handleMessageListener);
};

export const extractCustomState = (state: string): any => {
	try {
		const parsedState = JSON.parse(state);
		const [customState] = Object.values(parsedState);
		return customState ?? {};
	} catch {
		return {};
	}
};

export const formatExchangeCodeForTokenServerURL = (
	serverUrl: string,
	clientId: string,
	code: string,
	redirectUri: string,
	state: string
) => {
	const url = serverUrl.split('?')[0];
	const anySearchParameters = queryToObject(serverUrl.split('?')[1]);
	return `${url}?${objectToQuery({
		...anySearchParameters,
		client_id: clientId,
		grant_type: 'authorization_code',
		code,
		redirect_uri: redirectUri,
		state: JSON.stringify(extractCustomState(state)),
	})}`;
};
