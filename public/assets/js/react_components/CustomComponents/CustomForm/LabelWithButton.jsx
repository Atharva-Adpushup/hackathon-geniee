var React = window.React,
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx");

var LabelWithButton = React.createClass({

    propTypes: {
        name: React.PropTypes.string,
        labelText: React.PropTypes.string,
        layout: React.PropTypes.string,
        buttonText: React.PropTypes.string,
        onButtonClick: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            name: "labelWithButton",
            labelText: "Custom Label",
            layout: "horizontal",
            buttonText: "button"
        }
    },

    renderHorizontalLayout: function() {
        return (
            <div className="clearfix">
                <Col className="u-padding-r10px" xs={8}>
                    <b>{this.props.labelText}</b>
                </Col>
                <Col className="u-padding-l10px" xs={4}>
                    <Button className="btn-lightBg" onClick={this.props.onButtonClick}>{this.props.buttonText}</Button>
                </Col>
            </div>
        )
    },

    renderVerticalLayout: function() {
        return (
            <div className="clearfix">
                <Col className="u-padding-b5px" xs={12} md={12}>
                    <b>{this.props.labelText}</b>
                </Col>
                <Col className="u-padding-0px" xs={12} md={12}>
                    <Button className="btn-lightBg" onClick={this.props.onButtonClick}>{this.props.buttonText}</Button>
                </Col>
            </div>
        )
    },

    render: function() {
        var options = {
            layout: (this.props.layout.toLowerCase()) ? this.props.layout.toLowerCase() : "horizontal",
            layoutClassName: "form-group"
        };

        if (options.layout === "vertical") {
            options.layoutClassName += " form-group--vertical";
        } else if (options.layout === "horizontal") {
            options.layoutClassName += " form-group--horizontal";
        }


        return (
            <Row key={this.props.name} className={options.layoutClassName}>
                {(options.layout === "vertical") ? this.renderVerticalLayout(): this.renderHorizontalLayout()}
            </Row>
        );
    }
});

module.exports = LabelWithButton;