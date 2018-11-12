import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App.jsx';
import configureStore from './store/index.js';
// import './styles.scss';

const initialData = {},
	store = configureStore(initialData);

ReactDOM.render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('tagManagerPanel')
);
document.querySelector('.spinner').style.display = 'none';
