import React from 'react';
import { storiesOf } from '@storybook/react';
import SplitScreen from '../Components/Layout/SplitScreen';
import '../scss/apps/layout/index.scss';

storiesOf('UI.SplitScreen', module).add('default', () => (
	<div>
		<SplitScreen
			rootClassName="u-margin-4"
			leftChildren={<div className="u-height-half">Left Panel Data</div>}
			rightChildren={<div className="u-height-half">Right Panel Data</div>}
		/>
	</div>
));
