import { OAUTH_RESPONSE, EXCHANGE_CODE_FOR_TOKEN_METHODS } from './constants';

export type TAuthTokenPayload = {
	token_type: string;
	expires_in: number;
	access_token: string;
	scope: string;
	refresh_token: string;
};

type TExchangeCodeForTokenQuery = {
	url: string;
	method: (typeof EXCHANGE_CODE_FOR_TOKEN_METHODS)[number];
	headers?: Record<string, any>;
};

type TExchangeCodeForTokenQueryFn<TData = TAuthTokenPayload> = (
	callbackParameters: any
) => Promise<TData>;

export type TResponseTypeBasedProps<TData = TAuthTokenPayload> =
	| RequireOnlyOne<
			{
				responseType: 'code';
				exchangeCodeForTokenQuery: TExchangeCodeForTokenQuery;
				exchangeCodeForTokenQueryFn: TExchangeCodeForTokenQueryFn<TData>;
				onSuccess?: (payload: TData) => void;
			},
			'exchangeCodeForTokenQuery' | 'exchangeCodeForTokenQueryFn'
	  >
	| {
			responseType: 'token';
			onSuccess?: (payload: TData) => void;
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

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
	{
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>;
	}[Keys];
