import React, { PropTypes } from 'react';
import MarginEditor from './marginEditor.jsx';
import CustomCssEditor from './customCssEditor.jsx';


class cssEditor extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			isCustomEditor: false
		};
		this.renderCustomEditor = this.renderCustomEditor.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}


	handleSubmit(css) {
		this.props.onSave(css);
	}

	renderCustomEditor() {
		console.log('called');
		this.setState({ isCustomEditor: true });
	}

	render() {
		const props = this.props;
		return (<div>
			{
				(!this.state.isCustomEditor) ?
					(<MarginEditor initialValues={props.css} onAdvanced={this.renderCustomEditor} onSubmit={this.handleSubmit} onCancel={props.onCancel} />)
					:
					(<CustomCssEditor css={props.css} onSubmit={this.handleSubmit} onCancel={props.onCancel} />)
			}
		</div>);
	}
}

cssEditor.propTypes = {
	css: PropTypes.object.isRequired,
	onCancel: PropTypes.func.isRequired,
	onSave: PropTypes.func.isRequired
};

export default cssEditor;
