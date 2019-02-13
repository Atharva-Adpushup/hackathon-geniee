import React from 'react';
import { storiesOf } from '@storybook/react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCode } from '@fortawesome/free-solid-svg-icons';

import NamingConvention from './Components/StyleGuide/NamingConvention';
import Theme from './Components/StyleGuide/Theme';

library.add(faCode);

storiesOf('UI.StyleGuide', module)
	.add('Naming.Convention', () => <NamingConvention />)
	.add('Theme', () => <Theme />);
