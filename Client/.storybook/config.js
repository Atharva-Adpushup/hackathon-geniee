import { configure, addDecorator } from '@storybook/react';
import { withInfo } from '@storybook/addon-info';

//addDecorator(withInfo);

function loadStories() {
	require('../stories/welcome');
	require('../stories/styleGuide');
	require('../stories/loader.js');
	require('../stories/sidebar.js');
	require('../stories/fieldGroup.js');
	require('../stories/splitScreen.js');
}

configure(loadStories, module);
