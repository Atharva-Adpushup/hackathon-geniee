import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App';
import configureStore from './store/index.js';
// import OpsPanel from './components/OpsPanel.jsx';

// ReactDOM.render(<App />, document.getElementById('opsPanel'));

const initialData = {};
const store = configureStore(initialData);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('opsPanel')
);
