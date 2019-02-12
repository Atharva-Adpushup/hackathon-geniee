import React from 'react';
import { storiesOf } from '@storybook/react';

import NamingConvention from './Components/StyleGuide/NamingConvention';
import Theme from './Components/StyleGuide/Theme';

storiesOf('UI.StyleGuide', module)
	.add('Naming.Convention', () => <NamingConvention />)
	.add('Theme', () => <Theme />);
