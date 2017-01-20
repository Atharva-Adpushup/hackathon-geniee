import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import OuterEditor from 'components/outerEditor.jsx';
import { Provider } from 'react-redux';
import configureStore from 'store/configureStore.js';
import { loadInitialData } from 'libs/dataSyncService';
import { initMessageHandler } from './messengerHelper';
import unloadHandler from './unloadHandler';

const initComponents = (store) => {
		ReactDOM.render(React.createElement(Provider, { store }, React.createElement(OuterEditor, null)), document.querySelector('#editor'));
		document.querySelector('.spinner').style.display = 'none';
	},
	initEditor = () => {
		loadInitialData(window.ADP_SITE_ID)
			.then((initialData) => {
				// Configure store with data
				const store = configureStore(initialData);

				// Initiate unloadHandler
				window.onbeforeunload = unloadHandler(store);

				// Initiate Postmessage Listener
				initMessageHandler(store);

				// When document ready then render editor
				$(document).ready(() => {
					if (window.chrome) {
						initComponents(store);
					}
				});
			})
			.fail((err) => {
				document.querySelector('.spinner').style.display = 'none';
				$('#editor').html('Some error while loading editor, please try reloading');
			});
	};

export default initEditor;
