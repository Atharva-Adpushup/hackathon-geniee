import { h, Component } from 'preact';
import Abstract from './Abstract';

class StickyFooter extends Abstract {
	constructor(props) {
		super(props);
		this.name = 'Sticky Footer';
	}
	render() {
		return <div>{`I am a ${this.name} Ad with ${this.width}X${this.height}`}</div>;
	}
}

export default StickyFooter;
