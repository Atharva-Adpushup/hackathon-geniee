var React = window.React,
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    Utils = require("libs/custom/utils");

var NumericRange = React.createClass({
    propTypes: {
        name: React.PropTypes.string,
        minRange: React.PropTypes.number,
        maxRange: React.PropTypes.number,
        onValueChange: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            name: "numericRange",
            min: 0,
            max: 1000,
            minRange: 0,
            maxRange: 100
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

    setValue: function(name, ev) {
        var val;

        if (ev && ev.currentTarget) {
            val = parseInt(ev.currentTarget.value, 10);
        }

        switch (name) {
            case 'minRange':
                // If current value is more than maxRange, set value to maxRange
                if (val > this.state.maxRange) {
                    this.setState({'minRange': this.state.maxRange}, function() {
                        this.props.onValueChange([this.state.minRange, this.state.maxRange]);
                    }.bind(this));
                }
                // Else update the value
                else {
                    this.setState({'minRange': val}, function() {
                        this.props.onValueChange([this.state.minRange, this.state.maxRange]);
                    }.bind(this));
                }
                break;

            case 'maxRange':
                // If current value is less than minRange, set value to minRange
                if (val < this.state.minRange) {
                    this.setState({'maxRange': this.state.minRange}, function() {
                        this.props.onValueChange([this.state.minRange, this.state.maxRange]);
                    }.bind(this));
                }
                // Else update the value
                else {
                    this.setState({'maxRange': val}, function() {
                        this.props.onValueChange([this.state.minRange, this.state.maxRange]);
                    }.bind(this));
                }
                break;
        }
    },

    renderHorizontalLayout: function() {
        return (
            <div className="clearfix">
                <Col className="u-padding-r10px" xs={12} md={12}>
                    <input type="number" className="form-control" min={this.props.min} max={this.props.max} onChange={this.setValue.bind(null, 'minRange')} value={this.state.minRange} />
                    <span className="u-separator--colon">:</span>
                    <input type="number" className="form-control" min={this.props.min} max={this.props.max} onChange={this.setValue.bind(null, 'maxRange')} value={this.state.maxRange} />
                </Col>
            </div>
        )
    },

    render: function() {
        var options = {
            layoutClassName: "form-group form-group--horizontal form-group--range form-group--range-numeric"
        };

        return (
            <Row key={this.props.name} className={options.layoutClassName}>
                {this.renderHorizontalLayout()}
            </Row>
        );
    }
});

module.exports = NumericRange;