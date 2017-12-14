import { h, render } from 'preact';
import App from './components/App';

const renderer = config => {
	config.forEach(config => {
		const node = document.createElement('div');
		document.body.appendChild(node);
		render(<App {...config} />, node);
	});
};

export default renderer;
