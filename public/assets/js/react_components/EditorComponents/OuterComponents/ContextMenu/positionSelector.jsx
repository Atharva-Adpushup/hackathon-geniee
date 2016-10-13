var React = window.React;


module.exports = React.createClass({
    getDefaultProps: function () {
        return {};
    },
    render: function () {
        var self = this;

        return (
            <ul className="IMPosition">{this.props.insertOptions.map(function (option) {
                return (
                    <li onMouseOver={this.props.onMouseOver.bind(null,option)} onMouseOut={this.props.onMouseOut.bind(null,option)}>
                        <input
                            checked={(self.props.checked == option) ? "checked" : null}
                            type="radio"
                            id={option}
                            value={option}
                            onClick={self.props.onCheckedItem.bind(null, option)}
                        />
                        <label htmlFor={option}>{option}</label>
                    </li>)
            }.bind(this))}</ul>
        );
    }
});