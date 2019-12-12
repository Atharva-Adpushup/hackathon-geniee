import React from 'react';
import { storiesOf } from '@storybook/react';

import CustomButton from '../Components/CustomButton';

storiesOf('UI.CustomButton', module)
	.add('primary', () => (
		<div>
			<CustomButton type="button" variant="primary">
				Primary
			</CustomButton>
		</div>
	))
	.add('secondary', () => (
		<div>
			<CustomButton type="button" variant="secondary">
				Secondary
			</CustomButton>
		</div>
	))
	.add('withSpinner', () => (
		<div>
			<CustomButton type="button" variant="primary" showSpinner>
				With Spinner
			</CustomButton>
		</div>
	));
