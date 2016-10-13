var React = window.React,
	$ = require("libs/third-party/jquery"),
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    Utils = require("libs/custom/utils"),
    Panel = require("BootstrapComponents/Panel.jsx"),
    Accordion = require("BootstrapComponents/Accordion.jsx"),
    CustomInputNumber = require("CustomComponents/CustomForm/CustomInputNumber.jsx");

var NumericCollection = React.createClass({
    propTypes: {
        name: React.PropTypes.string,
		collection: React.PropTypes.array,
        onChange: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            name: "numericCollection",
			collection: []
        }
    },

	updateModel: function() {
		this.setState({
			model: this.getModel()
		}, function() {
			this.props.onChange($.extend(true, {}, this.state.model));
		});
	},

	componentDidMount: function() {
		this.updateModel();
	},

    getInitialState: function(props) {
        props = props || this.props;

        return {
			model: props.savedCollection || {}
        }
    },

    componentWillReceiveProps: function(nextprops) {
        if (Utils.deepDiffMapper.test(this.props, nextprops).isChanged) {
            this.setState(this.getInitialState(nextprops));
        }
    },

	onChange: function(ev) {
		this.updateModel();
	},

	getModel: function() {
		var modelKeys = Object.keys(this.refs),
			computedModel = {}, self = this;

		modelKeys.forEach(function(key) {
			var $el = $(React.findDOMNode(self.refs[key])).find("input[type='number']");

			computedModel[key] = $el.val();
		});

		return computedModel;
	},

	getPanelRows: function(rowsArr) {
		var rows = [], rowLength = rowsArr.length,
			rowInputValue, rowInputLabelText, i, rowItem, rowItemKey;

		for (i = 0; i < rowLength; i++) {
			rowItem = rowsArr[i];
			rowItemKey = Object.keys(rowItem)[0];
			rowInputValue = parseInt(rowItem[rowItemKey], 10);
			rowInputLabelText = rowItemKey.split("_");
			rowInputLabelText.splice(0, 1);
			rowInputLabelText.splice(2, 1);
			rowInputLabelText = rowInputLabelText.join(" ");

			rows.push((
				<CustomInputNumber ref={rowItemKey} respectNextPropsValue={false} labelText={rowInputLabelText} layout="horizontal" min={0} max={20} step={1} onChange={this.onChange} value={rowInputValue} />
			));
		}

		return rows;
	},

	renderCollectionPanels: function() {
		var collection = this.props.collection,
			collectionPanels = [],
			collectionKeys = Object.keys(collection),
			self = this;

			collectionKeys.forEach(function(collectionKey, idx) {
				var collectionArr = collection[collectionKey],
					idxValue = (idx + 1).toString(),
					panelHeaderText = collectionKey.split("_");

					panelHeaderText.splice(1, 1);
					panelHeaderText = panelHeaderText.join(" ");

				collectionPanels.push((
					<Panel header={panelHeaderText} eventKey={idxValue}>
						{self.getPanelRows(collectionArr)}
					</Panel>
				));
			});

			return collectionPanels;
	},

    renderHorizontalLayout: function() {
        return (
			<Accordion defaultActiveKey="1">
				{this.renderCollectionPanels()}
			</Accordion>
        )
    },

    render: function() {
        var options = {
            layoutClassName: "form-group form-group--horizontal"
        };

        return (
            <Row key={this.props.name} className={options.layoutClassName}>
                {this.renderHorizontalLayout()}
            </Row>
        );
    }
});

module.exports = NumericCollection;