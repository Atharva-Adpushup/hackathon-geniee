import React, { PropTypes } from 'react';
import MarginEditor from './marginEditor.jsx';
import { intersection } from 'lodash';
import CustomCssEditor from './customCssEditor.jsx';

class cssEditor extends React.Component {
	static defaultCssProps = ['margin-left', 'margin-right', 'margin-top', 'margin-bottom', 'clear'];

	static isCustomCss(css) {
		const keys = Object.keys(css),
			intersectedKeys = intersection(cssEditor.defaultCssProps, keys);
		return intersectedKeys &&
			(intersectedKeys.length != cssEditor.defaultCssProps.length || intersectedKeys.length != keys.length)
			? true
			: false;
	}

	constructor(props) {
		super(props);
		this.state = {
			isCustomEditor: cssEditor.isCustomCss(props.css)
		};
		this.renderCustomEditor = this.renderCustomEditor.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(css) {
		this.props.onSave(css);
	}

	renderCustomEditor() {
		this.setState({ isCustomEditor: true });
	}

	render() {
		const props = this.props;
		return (
			<div>
				{!this.state.isCustomEditor ? (
					<MarginEditor
						initialValues={props.css}
						onAdvanced={this.renderCustomEditor}
						onSubmit={this.handleSubmit}
						onCancel={props.onCancel}
					/>
				) : (
					<CustomCssEditor compact={props.compact} css={props.css} onSubmit={this.handleSubmit} onCancel={props.onCancel} />
				)}
			</div>
		);
	}
}

cssEditor.propTypes = {
	css: PropTypes.object.isRequired,
	onCancel: PropTypes.func.isRequired,
	onSave: PropTypes.func.isRequired
};

export default cssEditor;
