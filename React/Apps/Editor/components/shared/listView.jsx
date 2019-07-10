import React, { PropTypes } from 'react';

class ListView extends React.Component {
	render() {
		if (!this.props.items.length) {
			return null;
		}

		const listItems = this.props.items.map(item => {
			let itemKey;

			// If item is an array, show it as a comma separated string
			if (item.constructor === Array && Array.isArray(item)) {
				item = item.join(' , ');
			} else if (item.constructor === Object && typeof item === 'object') {
				itemKey = Object.keys(item)[0];
				item = `${itemKey} , ${item[itemKey]}`;
			}

			return (
				<li>
					{this.props.removeHandler ? (
						<a onClick={this.props.removeHandler.bind(null, item)} className="remove" href="#">
							<i className="fa fa-trash-o" />
						</a>
					) : null}
					{this.props.disableHandler ? (
						<a onClick={this.props.addHandler.bind(null, item)} className="disable" href="#">
							<i className="fa fa-ban" />
						</a>
					) : null}
					{this.props.addHandler ? (
						<a onClick={this.props.addHandler.bind(null, item)} className="completed" href="#">
							<i className="fa fa-plus" />
						</a>
					) : null}
					{this.props.display ? item[this.props.display] : item}
				</li>
			);
		});
		return (
			<div className="listView">
				{this.props.title ? (
					<div className="title">
						<h1>{this.props.title}</h1>
					</div>
				) : null}
				<ul>{listItems}</ul>
			</div>
		);
	}
}

ListView.defaultProps = {
	items: []
};

export default ListView;
