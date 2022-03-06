import { Grid, Link, Typography } from '@mui/material';
import { Loyalty } from '@mui/icons-material';
import { useUiStore } from '../../store/ui';

import Logo from '../common/Logo';

const Home = () => {
	const stuff = useUiStore((state) => state.stuff);

	return (
		<Grid
			container
			alignItems="center"
			bgcolor="secondary.main"
			direction="column"
			height="100vh"
			justifyContent="center"
			textAlign="center"
		>
			<Grid item>
				<Logo />
			</Grid>
			<Grid item>
				<Typography sx={{ color: 'common.white' }} variant="h4">
					{'Edit '}
					<code>src/App.js</code>
					{' and save to reload.'}
					<Loyalty />
				</Typography>
			</Grid>
			<Grid item>
				<Link href="https://reactjs.org" rel="noopener noreferrer" target="_blank">
					<Typography variant="h5">{stuff}</Typography>
				</Link>
			</Grid>
		</Grid>
	);
};

export default Home;
