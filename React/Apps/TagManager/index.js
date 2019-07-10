import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App.jsx';
import configureStore from './store/index.js';
import { getInitData } from './lib/helpers';
// import './styles.scss';
getInitData().then(initialData => {
	const store = configureStore(initialData);

	ReactDOM.render(
		<Provider store={store}>
			<App />
		</Provider>,
		document.getElementById('tagManagerPanel')
	);
	document.querySelector('.spinner').style.display = 'none';
});
