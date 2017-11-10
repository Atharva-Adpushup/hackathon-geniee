import React from 'react';
import ReactDOM from 'react-dom';
import ReportingPanel from './components/ReportingPanel.jsx';

ReactDOM.render(<ReportingPanel />, document.getElementById('reportingPanel'));
document.querySelector('.spinner').style.display = 'none';
