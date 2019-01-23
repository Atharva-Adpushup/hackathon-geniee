import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App';
import configureStore from './store/index.js';

const initialData = {},
	store = configureStore(initialData);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('opsPanel')
);
document.querySelector('.spinner').style.display = 'none';
