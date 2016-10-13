var React = window.React,
    validator = require("validator"),
    utils = require("libs/custom/utils.js"),
    joinClasses = require('BootstrapComponents/utils/joinClasses'),
    Button = require("BootstrapComponents/Button.jsx"),
    Row = require("BootstrapComponents/Row.jsx"),
    Col = require("BootstrapComponents/Col.jsx");

module.exports = React.createClass({
    getInitialState: function() {
        return {isValid: true}
    },
    componentWillMount: function() {
        this.inputs = {}; // Array of registered inputs
        this.model = {};
        // Register inputs from children
        this.registerInputs(this.props.children);
    },
    componentWillReceiveProps: function(nextprops) {
        // Register inputs from children
        this.registerInputs(nextprops.children);
    },
    registerInputs: function(children) {
        // A React helper for traversing children
        React.Children.forEach(children, function(child) {
            if (child && child.props) {
                if (child.props.name) {

                    // We attach a method for the input to register itself to the form
                    child.props.attachToForm = this.attachToForm;

                    // We attach a method for the input to detach itself from the form
                    child.props.detachFromForm = this.detachFromForm;

                    // We also attach a validate method to the props of the input so
                    // whenever the value is updated, the input will run this validate method
                    child.props.validate = this.validate;
                }

                // If the child has its own children, traverse through them also...
                // in the search for inputs
                if (child.props.children) {
                    this.registerInputs(child.props.children);
                }
            }

        }.bind(this));
    },

    // The validate method grabs what it needs from the component,
    // validates the component and then validates the form
    validate: function(component) {

        // If no validations property, do not validate
        if (!component.props.validations) {
            return;
        }

        // We initially set isValid to true and then flip it if we
        // run a validator that invalidates the input
        var isValid = true;
        var componentValue = component.state.value;


        // We only validate if the input has value or if it is required
        if (component.props.value || component.props.required) {

            // We split on comma to iterate the list of validation rules
            component.props.validations.split(',').forEach(function (validation) {

                if (utils.isNumber(parseInt(componentValue, 10)) && componentValue.constructor === Number) {
                    componentValue = parseInt(componentValue, 10);

                    if ((componentValue >= parseInt(component.props.min, 10)) && (componentValue <= parseInt(component.props.max, 10))) {
                        isValid = true;
                    } else {
                        isValid = false;
                    }
                    return false;
                }

                if ((componentValue.constructor === Array) && Array.isArray(componentValue)) {
                    if (componentValue.length > 0) {
                        isValid = true;
                    } else {
                        isValid = false;
                    }
                    return false;
                }

                var args = validation.split(':'),
                    validateMethod = args.shift();
                args = args.map(function (arg) { return JSON.parse(arg); });
                args = [component.state.value].concat(args);
                if (!validator[validateMethod].apply(validator, args)) {
                    isValid = false;
                }
            });

        }

        // Now we set the state of the input based on the validation
        if (isValid !== component.state.isValid) {
            component.setState({isValid: isValid}, function () {
                this.validateForm();
            }.bind(this));
        }
    },

    isAllValid: function () {
        // We set allIsValid to true and flip it if we find any
        // invalid input components
        var allIsValid = true;
        // Now we run through the inputs registered and flip our state
        // if we find an invalid input component
        var inputs = this.inputs;

        Object.keys(inputs).forEach(function (name) {
            // Only proceed if required property is defined
            // and state value is false
            if (inputs[name].props.required && !inputs[name].state.isValid) {
                allIsValid = false;
            }
        });
        return allIsValid;
    },
    validateForm: function() {
        this.setState({isValid:this.isAllValid()})
    },

    // All methods defined are bound to the component by React JS, so it is safe to use "this"
    // even though we did not bind it. We add the input component to our inputs map
    attachToForm: function(component) {
        this.inputs[component.props.name] = component;

        // We add the value from the component to our model, using the
        // name of the component as the key. This ensures that we
        // grab the initial value of the input
        this.model[component.props.name] = component.state.value;

        /*// We have to validate the input when it is attached to put the
        // form in its correct state
        this.validate(component);*/
    },

    // We want to remove the input component from the inputs map
    detachFromForm: function(component) {
        delete this.inputs[component.props.name];

        // We of course have to delete the model property
        // if the component is removed
        delete this.model[component.props.name];
    },

    // We need a method to update the model when submitting the form.
    // We go through the inputs and update the model
    updateModel: function (component) {
        Object.keys(this.inputs).forEach(function (name) {
            this.model[name] = this.inputs[name].state.value;
        }.bind(this));
    },

    // We prevent the form from doing its native
    // behaviour, update the model and log out the value
    submit: function (event) {
        event.preventDefault();
        Object.keys(this.inputs).forEach(function (name) {
            this.validate(this.inputs[name]);
        }.bind(this));
        setTimeout(function () {
            if (this.state.isValid) {
                this.updateModel();
                this.props.onSubmit(this.model);
            }
        }.bind(this))
    },

    renderInlineBtn: function(allValid) {
        return (
            <Row>
                <Col className="u-padding-r10px" xs={12}>
                    <Button className="btn-lightBg btn-edit" disabled={!this.state.isValid} type="submit">SAVE</Button>
                </Col>
            </Row>
        )
    },

    renderBlockBtn: function() {
        return (
            <Row className="butttonsRow">
                <Col className="pd-10" xs={12}>
                    <Button disabled={!this.state.isValid} className="btn-lightBg btn-save btn-block" type="submit">Save</Button>
                </Col>
            </Row>
        )
    },

    render: function() {
        return (
            <form className={joinClasses("form form--custom", this.props.className)} onSubmit={this.submit}>
                {this.props.children}
                {this.props.showBlockBtn? this.renderBlockBtn(): this.renderInlineBtn()}
            </form>
        )
    }
});