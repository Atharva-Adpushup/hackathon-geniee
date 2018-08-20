import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import CustomToggleSwitch from './helper/CustomToggleSwitch.jsx';
import '../style.scss';
class MenuSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			menu: props.menu
		};
	}
	renderLinks = () => {
		const listLinks = this.state.menu.links.map((linkView, index) => {
			return (
				<div key={index} className="adContainerStyle">
					<div
						className="fa fa-times-circle fa-2x deleteAdBtnStyle"
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
			<CollapsePanel title="Menu Settings" className="mediumFontSize" noBorder={true}>
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
					id="includeMenu"
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
				<RowColSpan label="Links" />
				{this.renderLinks()}
				<RowColSpan label="">
					<button
						className="btn-primary addButton"
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
			</CollapsePanel>
		);
	};
}

export default MenuSettings;
