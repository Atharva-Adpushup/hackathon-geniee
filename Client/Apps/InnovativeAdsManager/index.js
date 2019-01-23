import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App';
import configureStore from './store/index';

const initialData = {};
const store = configureStore(initialData);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('interactiveAdsPanel')
);
document.querySelector('.spinner').style.display = 'none';
