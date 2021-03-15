import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import $ from 'jquery';
import configureStore from 'store/inner/configureStore.js';
import InnerEditor from 'components/innerEditor.jsx';
import { initDomEvents } from './domManager';
import { initMessageHandler } from './messengerHelper';

const initEditor = () => {
	$(document).ready(() => {
		const store = configureStore(),
			rootElm = $(
				'<div class="_ap_reject" id="adPushupEditor" style="display: block !important" />'
			)
				.insertAfter('body')
				.get(0);
		ReactDOM.render(
			React.createElement(Provider, { store }, React.createElement(InnerEditor, null)),
			rootElm
		);
		initDomEvents(store);
		initMessageHandler(store);
	});
};

export default initEditor;
