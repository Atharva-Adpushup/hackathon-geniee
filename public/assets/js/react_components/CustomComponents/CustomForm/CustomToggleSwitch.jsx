var React = window.React,
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx"),
    Utils = require("libs/custom/utils");


module.exports = React.createClass({
    mixins: [],

    getDefaultProps: function() {
        return {
            on: "Enable",
            off: "Disable",
            defaultLayout: false
        };
    },


    // Create an initial state with the value passed to the component
    // or an empty value
    getInitialState: function(props) {
        props = props || this.props;

        return {
            value: props.checked || false
        }
    },

    componentWillReceiveProps: function(nextprops) {
        if (this.props.checked !== nextprops.checked) {
            this.setState(this.getInitialState(nextprops));
        }
    },

    componentWillMount: function() {
        if (this.props.attachToForm) {
            this.props.attachToForm(this); // Attaching the component to the form
        }
    },
    componentWillUnmount: function() {
        if (this.props.detachFromForm) {
            this.props.detachFromForm(this); // Detaching if unmounting
        }
    },
    setValue: function() {
        this.props.onChange ? this.props.onChange(!this.state.value) : null;
        this.setState({
            value: !this.state.value
        });
    },

    renderToggleSwitch: function() {
        return (
            <div className={this.props.size == "s" ? "toggle toggleSizeSmall" : "toggle"}>
                <input id={this.props.id} name={this.props.name} type="checkbox" checked={this.state.value} onChange={this.setValue} />
                <label htmlFor={this.props.id}>
                    <div className="toggleSwitch" data-on={this.props.on} data-off={this.props.off}>
                    </div>
                </label>
            </div>
        )
    },

    /**
     * Render horizontal layout of component
     * @param options
     * @returns {XML}
     */
    renderHorizontalLayout: function(options) {
        var labelClassNames = (options.defaultLayout) ? "" : "u-padding-r10px",
            componentClassNames = (options.defaultLayout) ? "" : "u-padding-l10px";

        return (
            <div className={options.errorClassName}>
                <Col className={labelClassNames} xs={8}>
                    <b>{this.props.labelText}</b>
                </Col>
                <Col className={componentClassNames} xs={4}>
                    {this.renderToggleSwitch()}
                </Col>
            </div>
        )
    },

    /**
     * Render vertical layout of component
     * @param options
     * @returns {XML}
     */
    renderVerticalLayout: function(options) {
        var labelClassNames = (options.defaultLayout) ? "" : "u-padding-b5px",
            componentClassNames = (options.defaultLayout) ? "" : "u-padding-0px";
        
        return (
            <div className={options.errorClassName}>
                <Col className={labelClassNames} xs={12} md={12}>
                    <b>{this.props.labelText}</b>
                </Col>
                <Col className={componentClassNames} xs={12} md={12}>
                    {this.renderToggleSwitch()}
                </Col>
            </div>
        )
    },

    render: function () {

        // We create variables that states how the input should be marked.
        // Should it be marked as valid? Should it be marked as required?
        var options = {
            errorClassName: 'clearfix',
            layout: (this.props.layout.toLowerCase()) ? this.props.layout.toLowerCase() : "horizontal",
            layoutClassName: "form-group",
            defaultLayout: this.props.defaultLayout,
            classNamesProps: (this.props.className && this.props.className.length > 0) ? this.props.className : ""
        };

        if (options.layout === "vertical") {
            options.layoutClassName += " form-group--vertical";
        } else if (options.layout === "horizontal") {
            options.layoutClassName += " form-group--horizontal";
        }

        // Concatenate props class names
        options.layoutClassName += " " + options.classNamesProps;

        return (
            <Row key={this.props.name} className={options.layoutClassName}>
                {(options.layout === "vertical") ? this.renderVerticalLayout(options): this.renderHorizontalLayout(options)}
            </Row>
        );
    }
});