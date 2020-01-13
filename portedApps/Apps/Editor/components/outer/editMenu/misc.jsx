let React = window.React,
	Row = require('BootstrapComponents/Row.jsx'),
	CommonConsts = require('editor/commonConsts'),
	Button = require('BootstrapComponents/Button.jsx'),
	Input = require('BootstrapComponents/Input.jsx'),
	Autocomplete = require('CustomComponents/comboBox/main.js'),
	Combobox = Autocomplete.Combobox,
	ComboboxOption = Autocomplete.Option,
	Col = require('BootstrapComponents/Col.jsx');

module.exports = React.createClass({
	getInitialState() {
		return {
			editSection: false,
			duplicateName: false,
			editXpath: false,
			selectedXpath: this.props.section.xpath
		};
	},
	getDefaultProps() {
		return {};
	},
	toggleSectionEdit() {
		this.setState({ editSection: !this.state.editSection });
	},
	toggleXpathEdit() {
		this.setState({ editXpath: !this.state.editXpath });
		if (!this.props.section.allXpaths.length) {
			this.props.flux.actions.getSectionAlternateXpaths(this.props.section.id);
		}
	},
	saveSection() {
		let name = $(React.findDOMNode(this.refs.section))
			.find('input')
			.val();
		if (name) {
			let sec = this.props.flux
				.store(CommonConsts.enums.stores.SECTION_STORE)
				.getChannelSectionByName(this.props.section.channelId, name);
			if (!sec) {
				this.props.flux.actions.updateSection({ id: this.props.section.id, name });
				this.setState({ editSection: false, duplicateName: false });
			} else if (this.props.section.name.toLowerCase() == name.toLowerCase()) {
				this.setState({ duplicateName: false, editSection: false });
			} else {
				this.setState({ duplicateName: true });
			}
		}
	},
	getComboxOptions() {
		return this.props.section.allXpaths.map((xpath, key) => {
			return <ComboboxOption key={key} value={xpath}>{xpath}</ComboboxOption>;
		});
	},
	handleXpathSelect(xpath) {
		this.setState({ selectedXpath: xpath });
	},
	saveXpath() {
		this.props.flux.actions.tryEditingXpath(this.props.section.id, this.state.selectedXpath);
		this.props.flux.actions.scrollSectionToScreen(this.props.section);
		this.toggleXpathEdit();
	},
	handleXpathInput(xpath) {
		if (xpath) {
			this.setState({ selectedXpath: xpath });
		}
	},
	render() {
		return (
			<div className="containerButtonBar contextEditMenu">
				{!this.state.editSection ? (
					<Row>
						<Col xs={3} className="pd-10">
							<b>Name</b>
						</Col>
						<Col xs={7} className="pd-10">
							{this.props.section.name}
						</Col>
						<Col xs={2} className="pd-10">
							<i className="fa fa-pencil-square-o" onClick={this.toggleSectionEdit} />
						</Col>
					</Row>
				) : (
					<Row>
						{this.state.duplicateName ? <Col xs={12}>Same Section Name Exists</Col> : null}
						<Col xs={12} className="pd-10 mB-5">
							<b>Name</b>
						</Col>
						<Col xs={12} className="pd-10">
							<Input type="text" ref="section" defaultValue={this.props.section.name} />
						</Col>
						<Col xs={12} className="pd-10">
							<Button className="btn-lightBg btn-Small btn-save" onClick={this.saveSection} />
						</Col>
					</Row>
				)}
				{!this.state.editXpath ? (
					<Row>
						<Col xs={3} className="pd-10">
							<b>Xpath</b>
						</Col>
						<Col xs={7} className="pd-10">
							{this.props.section.xpath}
						</Col>
						<Col xs={2} className="pd-10">
							<i className="fa fa-pencil-square-o" onClick={this.toggleXpathEdit} />
						</Col>
					</Row>
				) : (
					<Row>
						<Col xs={12} className="pd-10 mB-5">
							<b>Xpath</b>
						</Col>
						<Col xs={12} className="pd-10 mB-10">
							{!this.props.section.allXpaths.length ? (
								'Loading...'
							) : (
								<Combobox
									onSelect={this.handleXpathSelect}
									onInput={this.handleXpathInput}
									value={this.state.selectedXpath}
								>
									{this.getComboxOptions()}
								</Combobox>
							)}
						</Col>
						<Col xs={12} className="pd-10">
							<Button className="btn-lightBg btn-Small btn-save" onClick={this.saveXpath} />
						</Col>
					</Row>
				)}
				<Row>
					<Col xs={3} className="pd-10">
						<b>Operation</b>
					</Col>
					<Col xs={9} className="pd-10">
						{this.props.section.operation}
					</Col>
				</Row>
			</div>
		);
	}
});
