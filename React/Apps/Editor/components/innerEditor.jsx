import React from 'react';
import HighlighterBox from '../containers/inner/hbBoxContainer.js';
import VariationManager from '../containers/inner/variationManagerContainer.js';
import ElementHighLighter from '../containers/inner/elementHighLighterContainer.js';
import ContentOverlay from '../containers/inner/contentOverylayContainer.js';

const OuterEditor = () => (
	<div>
		<HighlighterBox />
		<VariationManager />
		<ElementHighLighter />
		<ContentOverlay />
	</div>
);

export default OuterEditor;
