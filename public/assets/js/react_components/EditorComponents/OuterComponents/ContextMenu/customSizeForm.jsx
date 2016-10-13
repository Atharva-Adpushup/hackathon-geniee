var React = window.React,
    $ = window.jQuery,
    Input = require("BootstrapComponents/Input.jsx"),
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    OverlayTrigger = require("BootstrapComponents/OverlayTrigger.jsx"),
    Tooltip = require("BootstrapComponents/Tooltip.jsx"),
    Button = require("BootstrapComponents/Button.jsx");

module.exports = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getDefaultProps: function () {

    },
    getInitialState: function () {

        return {
            showForm: false,
            height: 0,
            width: 0
        };
    },
    policiesPassed: function () {
        /*Only one dimension can be greater than 300 pixels
         The minimum width is 120 pixels
         The minimum height is 50 pixels
         Neither height nor width can exceed 1200 pixels.*/
        if ((this.state.width >= 120 && this.state.width <= 1200) && (this.state.height >= 50 && this.state.height <= 1200)) {
            if ((this.state.height > 300 && this.state.width > 300)) {
                return false
            }
            return true
        }
        return false
    },
    toggleForm: function () {
        this.setState({showForm: !this.state.showForm}, function() {
            this.props.updateMenu();
        });
    },
    save: function () {
        this.props.flux.actions.addCustomSizeToAdsense(this.state.width, this.state.height)
        this.setState(this.getInitialState());
    },
    render: function () {
        if (!this.state.showForm) {
            return (
                <div>
                    <Row style={{"text-align":"center"}}>
                        <Col xs={12}>
                            <Button className="btn-lightBg btn-add" onClick={this.toggleForm}>Add New Size </Button>
                        </Col>
                    </Row>
                </div>
            );
        }
        return (
            <div className="sm-pad" style={{"background-color":"rgba(85, 85, 85, 0.05)"}}>
                <Row>
                    <Col xs={6}><b>Width</b></Col>
                    <Col xs={6}><b>Height</b></Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <input style={{width: "100%"}} valueLink={this.linkState('width')} placeholder="Width"
                               type="number"/>
                    </Col>
                    <Col xs={6}>
                        <input style={{width: "100%"}} valueLink={this.linkState('height')} placeholder="Height"
                               type="number"/>
                    </Col>
                </Row>
                <Row style={{"text-align":"center"}}>
                    <Col xs={12}>
                        <Button disabled={!this.policiesPassed()} className="btn-lightBg btn-add" onClick={this.save}>ADD</Button>
                        <OverlayTrigger placement='bottom' overlay={<Tooltip><div>Only one dimension can be greater than 300 pixels.<br/>The minimum width is 120 pixels.<br/>The minimum height is 50 pixels.<br/>Neither height nor width can exceed 1200 pixels.</div></Tooltip>}>
                            <i style={{"margin":"5px"}} className="fa fa-info"/>
                        </OverlayTrigger>
                    </Col>
                </Row>
            </div>
        );
    }
})