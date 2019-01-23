import React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';

class closeChannel extends React.Component {
	render() {
		return (
			<div>
				<div className="installBtnBg">
					<Row>
						<Col md={12}>
							<Button onClick={this.props.closeChannelById} className="btn-lightBg btn-save btn-block">
								Close channel
							</Button>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
}

closeChannel.defaultProps = {};

export default closeChannel;
