import { h, render } from 'preact';
import StickyFooter from './StickyFooter';

const App = props => {
	const getComponent = () => {
		switch (props.format) {
			case 'stickyFooter':
			default:
				return <StickyFooter {...props} />;
				break;
		}
	};
	return <div>{getComponent()}</div>;
};

export default App;
