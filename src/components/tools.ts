import { OAUTH_STATE_KEY, POPUP_HEIGHT, POPUP_WIDTH } from './constants';
import { TOauth2Props } from './types';

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
	extraQueryParametersRef: React.MutableRefObject<TOauth2Props['extraQueryParameters']>
) => {
	const query = objectToQuery({
		response_type: responseType,
		client_id: clientId,
		redirect_uri: redirectUri,
		scope,
		state,
		...extraQueryParametersRef.current,
	});

	return `${authorizeUrl}?${query}`;
};

// https://medium.com/@dazcyril/generating-cryptographic-random-state-in-javascript-in-the-browser-c538b3daae50
export const generateState = () => {
	const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let array = new Uint8Array(40) as any;
	window.crypto.getRandomValues(array);
	array = array.map((x: number) => validChars.codePointAt(x % validChars.length));
	const randomState = String.fromCharCode.apply(null, array);
	return randomState;
};

export const saveState = (state: string) => {
	sessionStorage.setItem(OAUTH_STATE_KEY, state);
};

export const removeState = () => {
	sessionStorage.removeItem(OAUTH_STATE_KEY);
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

export const cleanup = (
	intervalRef: React.MutableRefObject<any>,
	popupRef: React.MutableRefObject<Window | null | undefined>,
	handleMessageListener: any
) => {
	clearInterval(intervalRef.current);
	closePopup(popupRef);
	removeState();
	window.removeEventListener('message', handleMessageListener);
};

export const formatExchangeCodeForTokenServerURL = (
	exchangeCodeForTokenServerURL: string,
	clientId: string,
	code: string,
	redirectUri: string,
	state: string
) => {
	const url = exchangeCodeForTokenServerURL.split('?')[0];
	const anySearchParameters = queryToObject(exchangeCodeForTokenServerURL.split('?')[1]);
	return `${url}?${objectToQuery({
		...anySearchParameters,
		client_id: clientId,
		grant_type: 'authorization_code',
		code,
		redirect_uri: redirectUri,
		state,
	})}`;
};
