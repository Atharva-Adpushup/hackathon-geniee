import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import CustomToggleSwitch from './helper/CustomToggleSwitch.jsx';
class MenuSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			menu: props.menu
		};
	}
	renderLinks = () => {
		const deleteAdBtnStyle = {
			position: 'absolute',
			right: '-8px',
			top: '-8px',
			cursor: 'pointer'
		},
			adContainerStyle = {
				background: '#f9f9f9',
				padding: '20px 10px 10px',
				margin: 10,
				borderRadius: 4,
				border: '1px solid #e9e9e9',
				position: 'relative'
			};
		const listLinks = this.state.menu.links.map((linkView, index) => {
			return (
				<div key={index} style={adContainerStyle}>
					<div
						style={deleteAdBtnStyle}
						className="fa fa-times-circle fa-2x"
						onClick={() => {
							let menu = this.state.menu, links = menu.links;
							links.splice(index, 1);
							this.setState({ menu });
						}}
						title="Delete This Link"
					/>
					<Row key={index}>
						<div className="form-group col-sm-6">
							<label> Name</label>
							<input
								className="form-control"
								onChange={e => {
									let menu = this.state.menu, links = menu.links, link = links[index];
									link.name = e.target.value;
									this.setState({ menu });
								}}
								type="text"
								placeholder="Name"
								name="name"
								value={linkView.name}
							/>
						</div>
						<div className="form-group col-sm-6">
							<label> Link</label>
							<input
								className="form-control"
								onChange={e => {
									let menu = this.state.menu, links = menu.links, link = links[index];
									link.link = e.target.value;
									this.setState({ menu });
								}}
								type="text"
								placeholder="Link"
								name="link"
								value={linkView.link}
							/>
						</div>
					</Row>
				</div>
			);
		});
		return <div>{listLinks}</div>;
	};
	render = () => {
		return (
			<div>
				<Heading title="Menu Settings" />

				<CustomToggleSwitch
					labelText="Include"
					className="mB-0"
					defaultLayout
					checked={this.state.menu.include}
					onChange={value => {
						let menu = this.state.menu;
						menu.include = value;
						this.setState({ menu });
					}}
					name="includeMenu"
					layout="horizontal"
					size="m"
					id="js-force-sample-url"
					on="On"
					off="Off"
				/>
				<RowColSpan label="Position">
					<select
						className="form-control"
						name="position"
						value={this.state.menu.position}
						onChange={e => {
							let menu = this.state.menu;
							menu.position = e.target.value;
							this.setState({ menu });
						}}
					>
						<option value="left">Left</option>
						<option value="right">Right</option>
					</select>
				</RowColSpan>
				<RowColSpan label="Links">
					<button
						className="btn-primary"
						type="button"
						onClick={() => {
							let menu = this.state.menu, links = menu.links;
							links.push({ name: '', link: '' });
							this.setState({ menu });
						}}
					>
						+ Add
					</button>
				</RowColSpan>
				{this.renderLinks()}
			</div>
		);
	};
}

export default MenuSettings;
