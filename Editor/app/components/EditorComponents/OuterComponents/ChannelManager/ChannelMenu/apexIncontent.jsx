var React = window.React,
	_ = require('libs/third-party/underscore.js'),
	ApexIncontentAdder = require('./apexIncontentAdder.jsx'),
	Button = require('BootstrapComponents/Button.jsx'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	CustomInputTextWithButton = require('CustomComponents/CustomForm/CustomInputTextWithButton.jsx'),
	Fluxxor = require('libs/third-party/fluxxor'),
	FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
	mixins: [FluxMixin],

	getInitialState: function() {
		return {
			showAdder: false,
			apexIncontentSection: {},
			contentSelector: this.props.channel.incontentSettings.contentSelector
		};
	},
	toggleAdder: function() {
		this.setState({showAdder: !this.state.showAdder}, function() {
			this.props.onUpdate();
		});
	},
	getApexSectionById: function(sectionId) {
		return _.findWhere(this.props.apexIncontentSections, {id: sectionId});;
	},
	onDeleteClick: function(sectionId) {
		if (confirm('Are you sure ? This action is not revesible')) {
			this.getFlux().actions.deleteSectionById(sectionId);
		}
	},
	onEditClick: function(sectionId) {
		var section = this.getApexSectionById(sectionId);

		this.setState({
			apexIncontentSection: section
		}, function() {
			this.setState({
				showAdder: true
			}, function() {
				this.props.onUpdate();
			});
		});
	},
	onContentSelectorChange: function(type, value) {

		switch (type) {
			case 'contentSelectorChange':
				this.setState({
					contentSelector: value
				});
				break;

			case 'contentSelectorSave':
				this.setState({
					contentSelector: value
				}, function() {
					if (this.state.contentSelector && (this.state.contentSelector.length > 0)) {
						this.getFlux().actions.changeContentSelector(this.props.channel, this.state.contentSelector);
					}
				});
				break;
		}
	},
	render: function() {
		var isContentSelectorValid = !!(this.state.contentSelector);

		if (this.state.showAdder) {
			return (<ApexIncontentAdder apexIncontentSection={this.state.apexIncontentSection}/>);
		}

		return (<div className="containerButtonBar sm-pad">
				<Row>
					<CustomInputTextWithButton respectNextPropsValue name="contentSelector" onValueChange={this.onContentSelectorChange.bind(null, 'contentSelectorChange')} onButtonClick={this.onContentSelectorChange.bind(null, 'contentSelectorSave')} layout="horizontal" buttonText="Save" value={this.state.contentSelector} validationError="Enter a valid content area css path" />
				</Row>
				{
					_(this.props.apexIncontentSections).map(function(section) {
						return (
							<Row>
								<Row>
									<Col className="u-padding-r10px" xs={6}>
										<b>Name: </b>{section.name}
									</Col>
									<Col className="u-padding-l10px" xs={6}>
										<b>Section: </b>{section.inContentSettings.section}
									</Col>
								</Row>
								<Row>
									<Col className="u-padding-r10px" xs={6}>
										<b>Height: </b>{section.inContentSettings.height}
									</Col>
									<Col className="u-padding-l10px" xs={6}>
										<b>Width: </b>{section.inContentSettings.width}
									</Col>
								</Row>
								<Col className="u-padding-r10px" xs={6}>
									<Button className="btn-lightBg btn-close btn-block" onClick={this.onEditClick.bind(null, section.id)}>
										Edit
									</Button>
								</Col>
								<Col className="u-padding-l10px" xs={6}>
									<Button className="btn-lightBg btn-close btn-block" onClick={this.onDeleteClick.bind(null, section.id)}>
										Delete
									</Button>
								</Col>
							</Row>
						);
					}.bind(this))
				}
				<Row className="butttonsRow">
					<Col xs={12}>
						<Button disabled={!isContentSelectorValid} className="btn-lightBg btn-add btn-block" onClick={this.toggleAdder}>
							Add New Section
						</Button>
					</Col>
				</Row>
		</div>);
	}
});
