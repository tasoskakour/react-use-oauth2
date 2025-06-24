import { OAUTH_RESPONSE, OAUTH_STATE_KEY, POPUP_HEIGHT, POPUP_WIDTH } from './constants';
import {
	objectToQuery,
	queryToObject,
	formatAuthorizeUrl,
	generateState,
	saveState,
	removeState,
	checkState,
	openPopup,
	closePopup,
	isWindowOpener,
	openerPostMessage,
	cleanup,
	formatExchangeCodeForTokenServerURL,
	extractCustomState,
} from './tools';

describe('objectToQuery', () => {
	it('should convert an object to a URL query string', () => {
		const object = { key1: 'value1', key2: 'value2' };
		expect(objectToQuery(object)).toEqual('key1=value1&key2=value2');
	});
});

describe('queryToObject', () => {
	it('should convert a URL query string to an object', () => {
		const query = 'key1=value1&key2=value2';
		const expectedObject = { key1: 'value1', key2: 'value2' };
		expect(queryToObject(query)).toEqual(expectedObject);
	});
});

describe('formatAuthorizeUrl', () => {
	it('should format the authorization URL correctly', () => {
		const authorizeUrl = 'https://example.com/oauth2/authorize';
		const clientId = '1234';
		const redirectUri = 'https://example.com/callback';
		const scope = 'read';
		const state = 'abc123';
		const responseType = 'code';
		const extraQueryParameters = { custom: 'value' };
		const expectedUrl =
			'https://example.com/oauth2/authorize?response_type=code&client_id=1234&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&scope=read&state=abc123&custom=value';
		expect(
			formatAuthorizeUrl(
				authorizeUrl,
				clientId,
				redirectUri,
				scope,
				state,
				responseType,
				extraQueryParameters
			)
		).toEqual(expectedUrl);
	});
});

describe('generateState', () => {
	it('should generate a random-wrapped empty object if no customState is provided', () => {
		const stateString = generateState();

		expect(typeof stateString).toBe('string');

		const parsed = JSON.parse(stateString);

		expect(typeof parsed).toBe('object');
		expect(parsed).not.toBeNull();
		expect(Object.keys(parsed).length).toBe(1);

		const [randomKey] = Object.keys(parsed);
		expect(typeof randomKey).toBe('string');
		expect(parsed[randomKey]).toEqual({});
	});

	it('should correctly wrap the provided custom state', () => {
		const customState = { visitedPage: '/dashboard', foo: 'bar' };
		const stateString = generateState(JSON.stringify(customState));

		const parsed = JSON.parse(stateString);
		const [randomKey] = Object.keys(parsed);

		expect(typeof randomKey).toBe('string');
		expect(parsed[randomKey]).toEqual(customState);
	});

	it('should fallback to empty object if invalid JSON passed', () => {
		// Force a wrong input manually
		const stateString = generateState('not-a-valid-json');

		const parsed = JSON.parse(stateString);
		const [randomKey] = Object.keys(parsed);

		expect(parsed[randomKey]).toEqual({});
	});
});

describe('saveState', () => {
	it('should save the state to sessionStorage', () => {
		saveState(sessionStorage, 'abc123');
		expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toEqual('abc123');
	});
});

describe('removeState', () => {
	it('should remove the state from sessionStorage', () => {
		sessionStorage.setItem(OAUTH_STATE_KEY, 'abc123');
		removeState(sessionStorage);
		expect(sessionStorage.getItem(OAUTH_STATE_KEY)).toBeNull();
	});
});

describe('checkState', () => {
	it('should return true if the received state matches the saved state', () => {
		sessionStorage.setItem(OAUTH_STATE_KEY, 'abc123');
		expect(checkState(sessionStorage, 'abc123')).toBe(true);
	});

	it('should return false if the received state does not match the saved state', () => {
		sessionStorage.setItem(OAUTH_STATE_KEY, 'abc123');
		expect(checkState(sessionStorage, 'def456')).toBe(false);
	});
});

describe('openPopup', () => {
	it('should open a popup window with the correct dimensions and position', () => {
		const url = 'https://example.com';
		const mockWindowOpen = jest.fn();
		window.open = mockWindowOpen;
		window.outerHeight = 1000;
		window.screenY = 1000;
		window.outerWidth = 500;
		window.screenX = 500;
		openPopup(url);
		expect(mockWindowOpen).toHaveBeenCalledWith(
			url,
			'OAuth2 Popup',
			`height=${POPUP_HEIGHT},width=${POPUP_WIDTH},top=1150,left=450`
		);
	});
});

describe('closePopup', () => {
	it('should close the popup window', () => {
		const closeMock = jest.fn();
		const popupRef = {
			current: { close: closeMock },
		} as unknown as React.MutableRefObject<Window>;
		closePopup(popupRef);
		expect(closeMock).toHaveBeenCalled();
	});
});

describe('isWindowOpener', () => {
	it('should return true when the opener is a Window object', () => {
		expect(isWindowOpener(window)).toBe(true);
	});

	it('should return false when the opener is null', () => {
		const opener = null;
		expect(isWindowOpener(opener)).toBe(false);
	});
});

describe('openerPostMessage', () => {
	it('should call postMessage on the opener window', () => {
		const postMessageMock = jest.fn();
		const opener = { postMessage: postMessageMock } as unknown as Window;
		openerPostMessage(opener as Window, {
			type: OAUTH_RESPONSE,
			payload: 'some-payload',
		});
		expect(postMessageMock).toHaveBeenCalledWith({
			type: OAUTH_RESPONSE,
			payload: 'some-payload',
		});
	});
});

describe('cleanup', () => {
	it('should clear the interval and close the popup window', () => {
		jest.useFakeTimers();
		jest.spyOn(global, 'clearInterval');

		const closePopupMock = jest.fn();
		const removeEventListenerMock = jest.fn();
		const intervalRef = { current: 123 } as unknown as React.MutableRefObject<
			string | number | NodeJS.Timeout | undefined
		>;
		const popupRef = {
			current: { close: closePopupMock },
		} as unknown as React.MutableRefObject<Window>;
		const handleMessageListener = jest.fn();
		window.removeEventListener = removeEventListenerMock;

		cleanup(intervalRef, popupRef, handleMessageListener);

		expect(clearInterval).toHaveBeenCalledWith(intervalRef.current);
		expect(closePopupMock).toHaveBeenCalled();
		expect(removeEventListenerMock).toHaveBeenCalledWith('message', handleMessageListener);
		jest.clearAllTimers();
	});
});

describe('formatExchangeCodeForTokenServerURL', () => {
	it('should return the URL with query parameters and extracted state', () => {
		const exchangeCodeForTokenServerURL = 'https://example.com/oauth/token';
		const clientId = '123';
		const code = '456';
		const redirectUri = 'https://example.com/callback';
		const wrappedState = JSON.stringify({
			randomKey_abc: {
				visitedPage: '/home',
				foo: 'bar',
			},
		});

		const expectedURL =
			'https://example.com/oauth/token?client_id=123&grant_type=authorization_code&code=456&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&state=%7B%22visitedPage%22%3A%22%2Fhome%22%2C%22foo%22%3A%22bar%22%7D';

		expect(
			formatExchangeCodeForTokenServerURL(
				exchangeCodeForTokenServerURL,
				clientId,
				code,
				redirectUri,
				wrappedState
			)
		).toBe(expectedURL);
	});
});

describe('extractCustomState', () => {
	it('should extract the custom state from a wrapped state', () => {
		const wrappedState = JSON.stringify({
			randomKey_xyz: {
				myKey: 'myValue',
				otherKey: 'otherValue',
			},
		});

		expect(extractCustomState(wrappedState)).toEqual({
			myKey: 'myValue',
			otherKey: 'otherValue',
		});
	});

	it('should return an empty object if parsing fails', () => {
		const invalidState = '{not-valid-json}';

		expect(extractCustomState(invalidState)).toEqual({});
	});

	it('should return an empty object if input is empty', () => {
		expect(extractCustomState('')).toEqual({});
	});
});
