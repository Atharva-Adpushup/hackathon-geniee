import React from 'react';
import ReactDOM from 'react-dom';
import ReportingPanel from './components/ReportingPanel.jsx';

const ReportingPanelComponent = ReactDOM.render(<ReportingPanel />, document.getElementById('reportingPanel'));

window.activeLegendItemsCallback = activeLegendItems => {
    ReportingPanelComponent.setState({ activeLegendItems });
};

document.querySelector('.spinner').style.display = 'none';
