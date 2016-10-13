var React = window.React,
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    Utils = require("libs/custom/utils");

var TextRange = React.createClass({
    propTypes: {
        name: React.PropTypes.string,
        minRange: React.PropTypes.string,
        maxRange: React.PropTypes.string,
        onValueChange: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            name: "textRange",
            minRange: "",
            maxRange: ""
        }
    },

    getInitialState: function(props) {
        props = props || this.props;

        return {
            minRange: props.minRange,
            maxRange: props.maxRange
        }
    },

    componentWillReceiveProps: function(nextprops) {
        if (Utils.deepDiffMapper.test(this.props, nextprops).isChanged) {
            this.setState(this.getInitialState(nextprops));
        }
    },

    getRangeObj: function(minRange, maxRange) {
        var obj = {};

        obj[minRange] = maxRange;
        return obj;
    },

    setValue: function(name, ev) {
        var val;

        if (ev && ev.currentTarget) {
            val = ev.currentTarget.value;
        }

        switch (name) {
            case 'minRange':
				this.setState({'minRange': val}, function() {
					this.props.onValueChange(this.getRangeObj(this.state.minRange, this.state.maxRange));
				}.bind(this));
                break;

            case 'maxRange':
				this.setState({'maxRange': val}, function() {
					this.props.onValueChange(this.getRangeObj(this.state.minRange, this.state.maxRange));
				}.bind(this));
                break;
        }
    },

    renderHorizontalLayout: function() {
        return (
            <div className="clearfix">
                <Col className="u-padding-0px" xs={12} md={12}>
                    <input type="text" className="form-control" onChange={this.setValue.bind(null, 'minRange')} value={this.state.minRange} />
                    <span className="u-separator--colon">:</span>
                    <input type="text" className="form-control" onChange={this.setValue.bind(null, 'maxRange')} value={this.state.maxRange} />
                </Col>
            </div>
        )
    },

    render: function() {
        var options = {
            layoutClassName: "form-group form-group--horizontal form-group--range form-group--range-text"
        };

        return (
            <Row key={this.props.name} className={options.layoutClassName}>
                {this.renderHorizontalLayout()}
            </Row>
        );
    }
});

module.exports = TextRange;