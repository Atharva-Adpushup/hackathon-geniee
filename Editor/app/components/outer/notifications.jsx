// Enhancements required //

var React = window.React;
var _ = require("../../../libs/third-party/underscore");

var Fluxxor = require("../../../libs/third-party/fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React);

var Alert = require("../../BootstrapComponents/Alert.jsx"),
    Button = require("../../BootstrapComponents/Button.jsx");

module.exports = React.createClass({
    mixins: [FluxMixin],

    getDefaultProps: function() {
        return{
            onOk: function() {
                console.log("OK");
            },
            onCancel: function() {
                console.log("Cancel");
            },
            onClose: function() {
                console.log("Close");
            }
        };
    },
    handleOk: function() {
        this.props.onOk();
    },
    handleCancel: function() {
        this.props.onCancel();
    },
    handleClose: function() {
        this.props.onClose();
    },
    render: function () {
        var notifications = this.props.notifications.map(function (notification) {
            var classes = "default";
            switch(notification.type) {
                case 'success':
                    classes = "success";
                    break;
                case 'error':
                    classes = "danger";
                    break;
                case 'info':
                    classes = "info";
                    break;
                case 'warning':
                    classes = "warning";
                    break;
            }

            return (
                <Alert onDismiss={this.handleClose} bsStyle={classes}>
                    <p><strong>Error:</strong>{notification.body}</p>
                </Alert>
            );
        }.bind(this));

        return (
            <div id="notifications" className="noficationWrapper">
            {notifications}
            </div>
        );
    }
});