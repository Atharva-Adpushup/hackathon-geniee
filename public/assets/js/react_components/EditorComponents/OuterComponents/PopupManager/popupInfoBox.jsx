var React = window.React,
    reactCSS = require("reactcss").ReactCSS,
    Draggabilly = require("draggabilly");

module.exports = React.createClass({

    getInitialState: function() {
        return {visibility: (this.props.isVisible || false)};
    },

    hide: function() {
        this.setState({ visibility: false });
    },

    getDefaultProps: function() {
        return {
			areaInAds: "0 %",
			viewportDimensions: "1366 X 768"
        };
    },

    componentWillReceiveProps: function(nextprops) {
        this.setState({visibility: nextprops.isVisible});
    },

    componentWillUnmount: function() {
        this.setState({
			areaInAds: "0 %",
			viewportDimensions: "1366 X 768"
        });
    },

    makeDraggable: function(popoverComponent) {
        if (!popoverComponent) {
            return;
        }

        var draggablePopover = new Draggabilly(popoverComponent.getDOMNode(), {});
    },

    render: function() {
        var popoverClassNames = "popover fade right in popover--custom-adrecover";

        if (this.state.visibility) {
            return (
            <div>
                <div ref={this.makeDraggable} className={popoverClassNames} role="tooltip" id="popover-adrecoverInfoBox">
                    <h3 className="popover-title">AdRecover Info</h3>
                    <div className="popover-content">
                        <ul className="list-group">
                            <li className="list-group-item">
                                <span className="badge">{this.props.areaInAds}</span>
                                <span className="list-group-item-content">Area in ads</span>
                            </li>
                            <li className="list-group-item">
                                <span className="badge">{this.props.viewportDimensions}</span>
                                <span className="list-group-item-content">VIEWPORT</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>);
        } else {
            return null;
        }
    }
});
