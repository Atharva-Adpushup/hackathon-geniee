import React from 'react';
import { storiesOf } from '@storybook/react';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	faCopy,
	faBars,
	faTachometerAlt,
	faList,
	faChartArea,
	faAlignCenter,
	faDollarSign,
	faDesktop,
	faPlus
} from '@/Client/helpers/fort-awesome-imports';

import NamingConvention from './Components/StyleGuide/NamingConvention';
import Theme from './Components/StyleGuide/Theme';

library.add(
	faCopy,
	faBars,
	faTachometerAlt,
	faList,
	faChartArea,
	faAlignCenter,
	faDollarSign,
	faDesktop,
	faPlus
);

storiesOf('UI.StyleGuide', module)
	.add('Naming.Convention', () => <NamingConvention />)
	.add('Theme', () => <Theme />);
