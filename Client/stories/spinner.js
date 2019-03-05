import React from 'react';
import { storiesOf } from '@storybook/react';

import Spinner from '../Components/Spinner';

storiesOf('UI.Spinner', module).add('default', () => (
	<div>
		<Spinner size={100} color="#000" />
	</div>
));
