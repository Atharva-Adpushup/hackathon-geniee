var React = window.React,
    Utils = require("libs/custom/utils");

module.exports = React.createClass({

    getDefaultProps: function() {
        return {
            respectNextPropsValue: false
        }
    },

    // Create an initial state with the value passed to the input
    // or an empty value
    getInitialState: function(props) {
        props = props || this.props;

        return {
            value: props.value || props.min,
            isValid: true
        };
    },

    componentWillReceiveProps: function(nextprops) {
        if (nextprops.respectNextPropsValue) {
            this.setState({value:nextprops.value}, function () {
                if (this.props.validate) {
                    this.props.validate(this);
                }
            }.bind(this))
        }
    },

    componentWillMount: function () {
        // If we use the required prop we add a validation rule
        // that ensures there is a value. The input
        // should not be valid with empty value
        if (this.props.required) {
            this.props.validations = this.props.validations ? this.props.validations : '';
        }

        if (this.props.attachToForm) {
            this.props.attachToForm(this); // Attaching the component to the form
        }
    },

    componentWillUnmount: function () {
        if (this.props.detachFromForm) {
            this.props.detachFromForm(this); // Detaching if unmounting
        }
    },

    // Whenever the input changes we update the value state
    // of this component
    setValue: function (event) {
        this.props.onChange ? this.props.onChange(event) : null;
        this.setState({
            value: parseInt(event.currentTarget.value, 10)
        },function() {
            if (this.props.validate) {
                this.props.validate(this);
            }
        }.bind(this));
    },

    /**
     * Render horizontal layout of component
     * @param options
     * @returns {XML}
     */
    renderHorizontalLayout: function(options) {
        return (
            <div className={options.errorClassName}>
                <Col className="u-padding-r10px" xs={8}>
                    <b>{this.props.labelText}</b>
                </Col>
                <Col className="u-padding-l10px" xs={4}>
                    <input type="number" className="form-control" name={this.props.name} min={this.props.min} max={this.props.max} onChange={this.setValue} value={this.state.value}/>
                </Col>
                <span className="form-group-feedback">{options.markAsValid || options.markAsRequired ? null : this.props.validationError}</span>
            </div>
        )
    },

    /**
     * Render vertical layout of component
     * @param options
     * @returns {XML}
     */
    renderVerticalLayout: function(options) {
        return (
            <div className={options.errorClassName}>
                <Col className="u-padding-b5px" xs={12} md={12}>
                    <b>{this.props.labelText}</b>
                </Col>
                <Col className="u-padding-0px" xs={12} md={12}>
                    <input type="number" className="form-control" name={this.props.name} min={this.props.min} max={this.props.max}  onChange={this.setValue} value={this.state.value}/>
                </Col>
                <span className="form-group-feedback">{options.markAsValid ? null : this.props.validationError}</span>
            </div>
        )
    },

    render: function() {

        // We create variables that states how the input should be marked.
        // Should it be marked as valid? Should it be marked as required?
        var options = {
            markAsValid: this.state.isValid,
            errorClassName: 'clearfix',
            layout: (this.props.layout.toLowerCase()) ? this.props.layout.toLowerCase() : "horizontal",
            layoutClassName: "form-group"
        };

        if (options.layout === "vertical") {
            options.layoutClassName += " form-group--vertical";
        } else if (options.layout === "horizontal") {
            options.layoutClassName += " form-group--horizontal";
        }

        // We prioritize marking it as required over marking it
        // as not valid
        if (!options.markAsValid) {
            options.errorClassName += ' u-error';
        }


        return (
            <Row key={this.props.name} className={options.layoutClassName}>
                {(options.layout === "vertical") ? this.renderVerticalLayout(options): this.renderHorizontalLayout(options)}
            </Row>
        );
    }
});