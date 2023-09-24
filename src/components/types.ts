import { OAUTH_RESPONSE } from './constants';

export type TAuthTokenPayload = {
	token_type: string;
	expires_in: number;
	access_token: string;
	scope: string;
	refresh_token: string;
};

export type TResponseTypeBasedProps<TData> =
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

export type TOauth2Props<TData = TAuthTokenPayload> = {
	authorizeUrl: string;
	clientId: string;
	redirectUri: string;
	scope?: string;
	extraQueryParameters?: Record<string, any>;
	onError?: (error: string) => void;
} & TResponseTypeBasedProps<TData>;

export type TState<TData = TAuthTokenPayload> = TData | null;

export type TMessageData =
	| {
			type: typeof OAUTH_RESPONSE;
			error: string;
	  }
	| {
			type: typeof OAUTH_RESPONSE;
			payload: any;
	  };
