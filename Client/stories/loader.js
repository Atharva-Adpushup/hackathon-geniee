import React from 'react';
import { storiesOf } from '@storybook/react';

import '../scss/index.scss';
import Loader from '../Components/Loader';

storiesOf('Loader', module).add('default', () => (
	<div>
		<Loader />
	</div>
));
