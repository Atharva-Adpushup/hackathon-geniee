import React from 'react';
import { storiesOf } from '@storybook/react';
import { linkTo } from '@storybook/addon-links';

import '../scss/index.scss';
import Welcome from './Components/Welcome/index';

storiesOf('Welcome', module).add('to AdPushup Storybook', () => <Welcome />);
