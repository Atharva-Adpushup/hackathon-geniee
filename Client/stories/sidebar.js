import React from 'react';
import { storiesOf } from '@storybook/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { Grid, Row } from 'react-bootstrap';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	faBars,
	faTachometerAlt,
	faList,
	faChartArea,
	faAlignCenter,
	faDollarSign,
	faDesktop,
	faPlus
} from '@fortawesome/free-solid-svg-icons';

import Sidebar from '../Components/Shell/Sidebar';

library.add(
	faBars,
	faTachometerAlt,
	faList,
	faChartArea,
	faAlignCenter,
	faDollarSign,
	faDesktop,
	faPlus
);

const stories = storiesOf('Sidebar', module);

stories.addDecorator(withKnobs);

stories.add('default', () => (
	<Router>
		<Grid fluid>
			<Row className="sidebar-main-wrap">
				<Sidebar show={boolean('show', true)} />
				<main className="main-content" />
			</Row>
		</Grid>
	</Router>
));
