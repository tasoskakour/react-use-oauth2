import { render } from '@testing-library/react';

import AuthPopup from './AuthPopup';

describe('AuthPopup', () => {
	test('renders the AuthPopup component', () => {
		render(<AuthPopup />);
	});
});
