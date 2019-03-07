import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import CustomModal from '../Components/CustomModal';

storiesOf('UI.CustomModal', module)
	.addDecorator(withKnobs)
	.add('default', () => {
		const label = 'show?';
		const defaultValue = true;
		const value = boolean(label, defaultValue);

		return (
			<div>
				<CustomModal show={value}>Content</CustomModal>
			</div>
		);
	});
