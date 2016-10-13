var React = window.React,
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    Utils = require("libs/custom/utils");

var CustomCssEditor = React.createClass({
    propTypes: {
        name: React.PropTypes.string,
        onValueChange: React.PropTypes.func
    },

    getDefaultProps: function() {
        return {
            "name": "customCssEditor",
            "value": {
                "margin-left": 0,
                "margin-right": 0,
                "margin-top": 0,
                "margin-bottom": 0
            }
        }
    },

    getInitialState: function(props) {
        props = props || this.props;

        return {
            "margin-left": props.value["margin-left"],
            "margin-right": props.value["margin-right"],
            "margin-top": props.value["margin-top"],
            "margin-bottom": props.value["margin-bottom"],
            "value": props.value
        }
    },

    componentWillReceiveProps: function(nextprops) {
        if (Utils.deepDiffMapper.test(this.props, nextprops).isChanged) {
            this.setState(this.getInitialState(nextprops));
        }
    },

    setValue: function(name, ev) {
        var val;
        var margins = {
            "margin-left": (this.state["margin-left"] == "auto") ? this.state["margin-left"] : parseInt(this.state["margin-left"], 10),
            "margin-right": (this.state["margin-right"] == "auto") ? this.state["margin-right"] : parseInt(this.state["margin-right"], 10),
            "margin-top": (this.state["margin-top"] == "auto") ? this.state["margin-top"] : parseInt(this.state["margin-top"], 10),
            "margin-bottom": (this.state["margin-bottom"] == "auto") ? this.state["margin-bottom"] : parseInt(this.state["margin-bottom"], 10)
        };

        if (ev && ev.currentTarget) {
            val = ev.currentTarget.value;

            if (!val || (typeof val === "string" && val !== "auto" && isNaN(val))) {
                val = 0;
            } else {
                val = (val == "auto" ? val : parseInt(val, 10));
            }
        }

        switch (name) {
            case "margin-left":
                margins["margin-left"] = val;

                this.setState({"margin-left": val, value: margins}, function() {
                    this.props.onValueChange(this.state.value);
                }.bind(this));
                break;

            case "margin-right":
                margins["margin-right"] = val;

                this.setState({"margin-right": val, value: margins}, function() {
                    this.props.onValueChange(this.state.value);
                }.bind(this));
                break;

            case "margin-top":
                margins["margin-top"] = val;

                this.setState({"margin-top": val, value: margins}, function() {
                    this.props.onValueChange(this.state.value);
                }.bind(this));
                break;

            case "margin-bottom":
                margins["margin-bottom"] = val;

                this.setState({"margin-bottom": val, value: margins}, function() {
                    this.props.onValueChange(this.state.value);
                }.bind(this));
                break;
        }
    },

    setAlignment: function (name) {
        var pixel = "px";
        var margins = {
            "margin-left": (this.state["margin-left"] == "auto") ? this.state["margin-left"] : parseInt(this.state["margin-left"], 10),
            "margin-right": (this.state["margin-right"] == "auto") ? this.state["margin-right"] : parseInt(this.state["margin-right"], 10),
            "margin-top": (this.state["margin-top"] == "auto") ? this.state["margin-top"] : parseInt(this.state["margin-top"], 10),
            "margin-bottom": (this.state["margin-bottom"] == "auto") ? this.state["margin-bottom"] : parseInt(this.state["margin-bottom"], 10)
        };

        switch (name) {
            case "left":
                margins["margin-right"] = "auto";
                margins["margin-left"] = 0;

                this.setState({"margin-right": "auto", "margin-left": 0, value: margins}, function() {
                    this.props.onValueChange(this.state.value);
                }.bind(this));
                break;
            case "right":
                margins["margin-right"] = 0;
                margins["margin-left"] = "auto";

                this.setState({"margin-left": "auto", "margin-right": 0, value: margins}, function() {
                    this.props.onValueChange(this.state.value);
                }.bind(this));
                break;
            case "center":
                margins["margin-right"] = "auto";
                margins["margin-left"] = "auto";

                this.setState({"margin-left": "auto", "margin-right": "auto", value: margins}, function() {
                    this.props.onValueChange(this.state.value);
                }.bind(this));
                break;
        }
    },

    renderVerticalLayout: function() {
        return (
            <div className="clearfix">
                <div className="manualSettings">
                    <Row className="cssPropertiesWrap">
                        <Col xs={12} className="pd-0">
                            <Row  className="cssPropertiesWrapInner">
                                <Col xs={3} className="pd-2">
                                    <input type="text" name="margin-left" onChange={this.setValue.bind(null, "margin-left")} value={this.state["margin-left"]} />
                                    <span>Left</span>
                                </Col>
                                <Col xs={3} className="pd-2">
                                    <input type="text" name="margin-right" onChange={this.setValue.bind(null, "margin-right")} value={this.state["margin-right"]} />
                                    <span>Right</span>
                                </Col>
                                <Col xs={3} className="pd-2">
                                    <input type="text" name="margin-top" onChange={this.setValue.bind(null, "margin-top")} value={this.state["margin-top"]} />
                                    <span>Top</span>
                                </Col>
                                <Col xs={3} className="pd-2">
                                    <input type="text" name="margin-bottom" onChange={this.setValue.bind(null, "margin-bottom")} value={this.state["margin-bottom"]} />
                                    <span>Bottom</span>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>

                <Row className="cssPropertiesAlign">
                    <Col xs={4} className="pd-0 btnCol">
                        <Button className="btn-align btn-align-left" onClick={this.setAlignment.bind(null, "left")}>Left</Button>
                    </Col>
                    <Col xs={4} className="pd-0 btnCol">
                        <Button className="btn-align btn-align-center" onClick={this.setAlignment.bind(null, "center")}>Center</Button>
                    </Col>
                    <Col xs={4} className="pd-0 btnCol">
                        <Button className="btn-align btn-align-right" onClick={this.setAlignment.bind(null, "right")}>Right</Button>
                    </Col>
                </Row>
            </div>
        )
    },

    render: function() {
        var options = {
            layoutClassName: "form-group form-group--vertical"
        };

        return (
            <Row key={this.props.name} className={options.layoutClassName}>
                {this.renderVerticalLayout()}
            </Row>
        );
    }
});

module.exports = CustomCssEditor;