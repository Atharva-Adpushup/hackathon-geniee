import thunk from 'redux-thunk';
import { applyMiddleware, createStore, compose } from 'redux';
import rootReducer from '../reducers';
import postMessageHanler from '../middlewares/postMessageHandler';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function(initialState = {}) {
	const store = createStore(
		rootReducer,
		initialState,
		composeEnhancers(
			applyMiddleware(thunk, postMessageHanler)
			/* storage(),*/
			// window.devToolsExtension ? window.devToolsExtension() : nope => nope
		)
	);

	if (module.hot) {
		module.hot.accept('../reducers', () => {
			const nextRootReducer = require('../reducers');

			store.replaceReducer(nextRootReducer);
		});
	}
	return store;
}
