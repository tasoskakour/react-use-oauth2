import { useCallback, useState } from 'react';

export type Oauth2Props = {
	authorizeUrl: string;
	clientId: string;
	redirectUri: string;
	scope?: string;
};

export type Auth = {
	token_type: string;
	expires_in: number;
	access_token: string;
	scope: string;
	refresh_token: string;
};

const enhanceAuthorizeUrl = (
	authorizeUrl: string,
	clientId: string,
	redirectUri: string,
	scope: string,
	state: string
) => {
	console.log({ authorizeUrl });
	return `${authorizeUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
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

const OAUTH_STATE_KEY = 'react-use-oauth2-state-key';

const saveState = (state: string) => {
	sessionStorage.setItem(OAUTH_STATE_KEY, state);
};

const POPUP_HEIGHT = 700;
const POPUP_WIDTH = 600;
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

const useOauth2 = (props: Oauth2Props) => {
	const { authorizeUrl, clientId, redirectUri, scope = '' } = props;
	const [auth, setAuth] = useState<Auth | null>(null);

	const getAuth = useCallback(() => {
		// Generate and save state
		const state = generateState();
		saveState(state);

		// Open popup (TODO: Set x,y)
		console.log(enhanceAuthorizeUrl(authorizeUrl, clientId, redirectUri, scope, state));
		openPopup(enhanceAuthorizeUrl(authorizeUrl, clientId, redirectUri, scope, state));
	}, [authorizeUrl, clientId, redirectUri, scope]);

	return { auth, getAuth };
};

export default useOauth2;
