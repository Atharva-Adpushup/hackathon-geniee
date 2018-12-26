import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App.jsx';
import configureStore from './store/index.js';

const initialData = {};
const store = configureStore(initialData);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('interactiveAdsPanel')
);
document.querySelector('.spinner').style.display = 'none';
