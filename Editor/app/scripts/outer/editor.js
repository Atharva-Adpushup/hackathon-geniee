import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import OuterEditor from 'EditorComponents/outerEditor.jsx';
import { Provider } from 'react-redux';
import configureStore from 'store/configureStore.js';
import { initMessageHandler } from './messengerHelper';
import unloadHandler from './unloadHandler';

const store = configureStore(),
	initComponents = () => {
		ReactDOM.render(React.createElement(Provider, { store }, React.createElement(OuterEditor, null)), document.querySelector('#editor'));
		document.querySelector('.spinner').style.display = 'none';
	},
	initEditor = () => {
		window.onbeforeunload = unloadHandler(store);
		initMessageHandler(store);
		$(document).ready(() => {
			if (window.chrome) {
				$(document).ready(() => {
					initComponents();
				});
			}
		});
	};

export default initEditor;
