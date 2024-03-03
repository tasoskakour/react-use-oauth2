import { useEffect } from 'react';
import { OAUTH_RESPONSE } from './constants';
import { checkState, isWindowOpener, openerPostMessage, queryToObject } from './tools';

type Props = {
	Component?: React.ReactElement;
};

let didInit = false;

export const OAuthPopup = ({
	Component = (
		<div style={{ margin: '12px' }} data-testid="popup-loading">
			Loading...
		</div>
	),
}: Props) => {
	useEffect(() => {
		if (didInit) return;
		didInit = true;

		const payload = {
			...queryToObject(window.location.search.split('?')[1]),
			...queryToObject(window.location.hash.split('#')[1]),
		};
		const state = payload?.state;
		const error = payload?.error;
		const opener = window?.opener;

		if (isWindowOpener(opener)) {
			const stateOk = state && checkState(opener.sessionStorage, state);

			if (!error && stateOk) {
				openerPostMessage(opener, {
					type: OAUTH_RESPONSE,
					payload,
				});
			} else {
				const errorMessage = error
					? decodeURI(error)
					: `${
							stateOk
								? 'OAuth error: An error has occured.'
								: 'OAuth error: State mismatch.'
						}`;

				openerPostMessage(opener, {
					type: OAUTH_RESPONSE,
					error: errorMessage,
				});
			}
		} else {
			throw new Error('No window opener');
		}
	}, []);

	return Component;
};
