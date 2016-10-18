import React from 'react';
import HighlighterBox from '../containers/inner/hbBoxContainer.js';
import VariationManager from '../containers/inner/variationManagerContainer.js';
import ElementHighLighter from '../containers/inner/elementHighLighterContainer.js';

const OuterEditor = () => (
	<div>
		<HighlighterBox />
		<VariationManager />
		<ElementHighLighter />
	</div>
);

export default OuterEditor;
