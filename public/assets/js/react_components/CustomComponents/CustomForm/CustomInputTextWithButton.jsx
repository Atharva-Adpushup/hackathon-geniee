var React = window.React,
	Button = require("BootstrapComponents/Button.jsx"),
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx");

module.exports = React.createClass({

    getDefaultProps: function() {
        return {
            respectNextPropsValue: false
        }
    },

    // Create an initial state with the value passed to the input
    // or an empty value
    getInitialState: function (props) {
        props = props || this.props;

        return {
            value: props.value || '',
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

    componentDidMount: function() {
        this.updateComponentValidity();
    },

    componentWillUnmount: function () {
        if (this.props.detachFromForm) {
            this.props.detachFromForm(this); // Detaching if unmounting
        }
    },

    // Whenever the input changes we update the value state
    // of this component
    setValue: function (event) {
        this.setState({
            value: event.currentTarget.value
        },

        // When the value changes, wait for it to propagate and
        // then validate the input
        function() {
			if (this.props.validate) {
				this.props.validate(this);
			}

            if (this.props.onValueChange && typeof (this.props.onValueChange === "function")) {
                this.props.onValueChange(this.state.value);
            }

            this.updateComponentValidity();
        }.bind(this));
    },

    updateComponentValidity: function() {
        if (!this.state.value) {
            this.setState({
                isValid: false
            });
        } else {
            this.setState({
                isValid: true
            });
        }
    },

	onButtonClick: function() {
		this.props.onButtonClick(this.state.value);
	},

    /**
     * Render horizontal layout of component
     * @param options
     * @returns {XML}
     */
    renderHorizontalLayout: function(options) {
        return (
            <div className={options.errorClassName}>
                <Col className="u-padding-b5px" xs={12} md={12}>
                    <b>{this.props.labelText}</b>
                </Col>
                <Col className="u-padding-0px" xs={8}>
                    <input type="text" className="form-control" name={this.props.name} onChange={this.setValue} value={this.state.value}/>
                </Col>
                <Col className="u-padding-0px" xs={4}>
                    <Button disabled={!options.markAsValid} className="btn-lightBg" onClick={this.onButtonClick}>{this.props.buttonText}</Button>
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
                    <input type="text" className="form-control" name={this.props.name} onChange={this.setValue} value={this.state.value}/>
                </Col>
                <Col className="u-padding-0px" xs={12} md={12}>
                    <Button disabled={!options.markAsValid} className="btn-lightBg" onClick={this.onButtonClick}>{this.props.buttonText}</Button>
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

		options.layoutClassName += " form-group--inputBtn";

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