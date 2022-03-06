import { CssBaseline } from '@mui/material';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { SnackbarProviderProps, SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router-dom';
import theme from '../utilities/theme';
import AppRoutes from './AppRoutes';
import { ApolloProvider, GaProvider } from './providers';

const snackbarOptions: SnackbarProviderProps = {
	maxSnack: 1,
	autoHideDuration: 4000,
	anchorOrigin: { vertical: 'top', horizontal: 'center' },
	// This is to silence ts complaining of missing children in props
	children: undefined,
};

const App = () => (
	<BrowserRouter>
		<GaProvider>
			<StyledEngineProvider injectFirst>
				<CssBaseline />
				<ThemeProvider theme={theme}>
					<SnackbarProvider {...snackbarOptions}>
						<ApolloProvider>
							<AppRoutes />
						</ApolloProvider>
					</SnackbarProvider>
				</ThemeProvider>
			</StyledEngineProvider>
		</GaProvider>
	</BrowserRouter>
);

export default App;
