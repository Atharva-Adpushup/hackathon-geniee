import React from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import Heading from './helper/Heading.jsx';
import RowColSpan from './helper/RowColSpan.jsx';
import CustomToggleSwitch from './helper/CustomToggleSwitch.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
class FooterSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			footer: props.footer
		};
	}
	render = () => {
		return (
			<CollapsePanel title="Footer Settings" className="mediumFontSize" noBorder={true}>
				<CustomToggleSwitch
					labelText="Include"
					className="mB-0"
					defaultLayout
					checked={this.state.footer.include}
					onChange={value => {
						let footer = this.state.footer;
						footer.include = value;
						this.setState({ footer });
					}}
					name="includeFooter"
					layout="horizontal"
					size="m"
					id="js-force-sample-url"
					on="On"
					off="Off"
				/>
				<RowColSpan label="Text">
					<input
						onChange={e => {
							let footer = this.state.footer;
							footer.label = e.target.value;
							this.setState({ footer });
						}}
						className="form-control"
						type="text"
						placeholder="Label"
						name={name}
						value={this.state.footer.label || ''}
					/>
				</RowColSpan>
			</CollapsePanel>
		);
	};
}

export default FooterSettings;
