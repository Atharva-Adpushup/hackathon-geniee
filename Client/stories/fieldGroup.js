import React from 'react';
import { storiesOf } from '@storybook/react';

import FieldGroup from '../Components/Layout/FieldGroup';

storiesOf('UI.FieldGroup', module)
	.add('text-only', () => (
		<FieldGroup id="input-number-siteId" label="Enter site id" value="25000" isTextOnly />
	))
	.add('input-text', () => (
		<div>
			<FieldGroup
				id="input-text-id"
				label="Enter text value"
				type="text"
				placeholder="Random alphanumeric values of 5 digits like 12wsa, 6hw5n etc."
				className=""
				onChange={() => {
					console.log('input number changed');
				}}
				value=""
			/>
		</div>
	))
	.add('input-number', () => (
		<div>
			<FieldGroup
				id="input-number-id"
				label="Enter number value"
				type="text"
				placeholder="Random alphanumeric values of 5 digits like 12wsa, 6hw5n etc."
				className=""
				onChange={() => {
					console.log('input number changed');
				}}
				value=""
			/>
		</div>
	))
	.add('button-toggle', () => {
		const buttonToggle = [
			{
				value: 1,
				text: 'first button'
			},
			{
				value: 2,
				text: 'second button'
			}
		];

		return (
			<div>
				<FieldGroup
					id="toggle-button-group"
					label="Select control ad type"
					type="toggle-button-group"
					buttonToggle={buttonToggle}
					onChange={() => {
						console.log('button toggle changed');
					}}
				/>
			</div>
		);
	});
