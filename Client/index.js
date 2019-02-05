import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import App from './App';
import configureStore from './store/index';
import './scss/index.scss';

const initialData = {};
const store = configureStore(initialData);

render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.querySelector('#root')
);
