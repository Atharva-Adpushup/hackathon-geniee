import React from 'react';
import ReactDOM from 'react-dom';
import AmpSettings from './components/AmpSettings.jsx';

const AmpSettingsComponent = ReactDOM.render(
	<AmpSettings />,
	document.getElementById('ampSettings')
);

// window.activeLegendItemsCallback = activeLegendItems => {
//     ReportingPanelComponent.setState({ activeLegendItems });
// };

// document.querySelector('.spinner').style.display = 'none';
