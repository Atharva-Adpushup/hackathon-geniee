import React from 'react';
import { storiesOf } from '@storybook/react';

import Loader from '../Components/Loader';

storiesOf('Loader', module).add('default', () => (
	<div>
		<Loader />
	</div>
));
