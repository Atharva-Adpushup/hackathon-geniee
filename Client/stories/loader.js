import React from 'react';
import { storiesOf } from '@storybook/react';

import Loader from '../Components/Loader';

storiesOf('UI.Loader', module).add('default', () => (
	<div>
		<Loader />
	</div>
));
