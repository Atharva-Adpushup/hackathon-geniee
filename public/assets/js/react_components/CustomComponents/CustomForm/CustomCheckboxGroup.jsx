/**
* @jsx React.DOM
*/
var React = window.React,
    Utils = require("libs/custom/utils");

module.exports = React.createClass({
    getDefaultProps: function() {
        return {
            respectNextPropsValue: false
        }
    },

    getInitialState: function(props) {
        props = props || this.props;

        return {
            value: props.value || [],
            isValid: true
        };
    },

    componentWillReceiveProps: function(nextprops) {
        if (nextprops.respectNextPropsValue && Utils.deepDiffMapper.test(this.state.value, nextprops.value).isChanged) {
            this.setState({value:nextprops.value}, function () {
                this.props.validate(this);
            }.bind(this))
        }
    },

    componentWillMount: function() {

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
    componentWillUnmount: function() {
        if (this.props.detachFromForm) {
            this.props.detachFromForm(this); // Detaching if unmounting
        }
    },

    componentDidMount: function() {
        this.setCheckboxNames();
        this.setCheckedBoxes();
    },

    componentDidUpdate: function() {
        this.setCheckboxNames();
        this.setCheckedBoxes();
    },

    setValue: function() {
        var checkedValues = this.getCheckedValues();

        this.props.onChange ? this.props.onChange(checkedValues) : null;
        this.setState({
            value: checkedValues
        },

        // When the value changes, wait for it to propagate and
        // then validate the input
        function() {
            this.props.validate(this);
        }.bind(this));
    },

    setCheckboxNames: function() {
        // stay DRY and don't put the same `name` on all checkboxes manually. Put it on
        // the tag and it'll be done here
        var $checkboxes = this.getCheckboxes();
        for (var i = 0, length = $checkboxes.length; i < length; i++) {
            $checkboxes[i].setAttribute('name', this.props.name);
        }
    },

    getCheckboxes: function() {
        return this.getDOMNode().querySelectorAll('input[type="checkbox"]');
    },

    setCheckedBoxes: function() {
        var $checkboxes = this.getCheckboxes();
        // if `value` is passed from parent, always use that value. This is similar
        // to React's controlled component. If `defaultValue` is used instead,
        // subsequent updates to defaultValue are ignored. Note: when `defaultValue`
        // and `value` are both passed, the latter takes precedence, just like in
        // a controlled component
        var destinationValue = ((this.state.value.constructor === Array) && (this.state.value.length > 0))  ? (this.state.value) : this.props.value;

        for (var i = 0, length = $checkboxes.length; i < length; i++) {
          var $checkbox = $checkboxes[i];

          // intentionally use implicit conversion for those who accidentally used,
          // say, `valueToChange` of 1 (integer) to compare it with `value` of "1"
          // (auto conversion to valid html value from React)
          if (destinationValue.indexOf($checkbox.value) >= 0) {
              $checkbox.checked = true;
          }
        }
    },

    getCheckedValues: function() {
        var $checkboxes = this.getCheckboxes();

        var checked = [];
        for (var i = 0, length = $checkboxes.length; i < length; i++) {
            if ($checkboxes[i].checked) {
                checked.push($checkboxes[i].value);
            }
        }

        return checked;
    },

    /**
     * Render vertical layout of component
     * @param options
     * @returns {XML}
     */
    renderVerticalLayout: function(options) {
        return (
            <Row key={this.props.name} className={options.layoutClassName}>
                <div className={options.errorClassName}>
                    <Col className="u-padding-b5px" xs={12} md={12}>
                        <b>{this.props.labelText}</b>
                    </Col>
                    <Col className="u-padding-0px" xs={12} md={12}>
                        <div {...this.props} onChange={this.setValue}>
                            {this.props.children}
                        </div>
                    </Col>
                    <span className="form-group-feedback">{options.markAsValid ? null : this.props.validationError}</span>
                </div>
            </Row>
        )
    },

    render: function() {

        // We create variables that states how the input should be marked.
        // Should it be marked as valid or not?
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
            this.renderVerticalLayout(options)
        );
    }
});