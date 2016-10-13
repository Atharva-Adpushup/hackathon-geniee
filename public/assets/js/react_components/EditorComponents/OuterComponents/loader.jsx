var React = window.React;

module.exports = React.createClass({
    getDefaultProps: function() {
        return {
            loading: true
        }
    },
    render: function(){
        var inlineStyle = {
            display: this.props.loading ? "block" : "none"
        };
        return (<div data-id="loader" style={inlineStyle} className="loaderwrapper spinner">
			<img src="/assets/images/loaderLogo.png" />
			</div>
		);
    }
})	