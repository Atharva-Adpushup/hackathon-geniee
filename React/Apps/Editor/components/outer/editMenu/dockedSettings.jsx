import React, { Component } from 'react';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';
import { Row, Col } from 'react-bootstrap';
import CodeBox from 'shared/codeBox';
import { CustomButton } from 'shared/components.jsx';

class DockedSettings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			docked: this.props.section && this.props.section.type == 4 ? true : false,
			css:
				this.props.section && this.props.section.formatData && this.props.section.formatData.css
					? this.props.section.formatData.css
					: '',
			bottomXPath:
				this.props.section && this.props.section.formatData && this.props.section.formatData.bottomXPath
					? this.props.section.formatData.bottomXPath
					: '',
			bottomOffset:
				this.props.section && this.props.section.formatData && this.props.section.formatData.bottomOffset
					? this.props.section.formatData.bottomOffset
					: ''
		};
		this.renderDockContent = this.renderDockContent.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
	}

	submitHandler(code) {
		if (code.length) {
			try {
				code = JSON.parse(`${code}`);
			} catch (e) {
				this.props.showNotification({
					mode: 'error',
					title: 'Operation failed',
					message: 'Invalid CSS'
				});
				return;
			}
		}
		this.setState(
			{
				css: code
			},
			() => {
				this.props.onFormatDataUpdate(this.props.section.id, {
					css: typeof code == 'string' ? {} : code,
					bottomXPath: this.state.bottomXPath,
					bottomOffset: this.state.bottomOffset
				});
				this.props.onCancel();
			}
		);
	}

	cssChangeHandler(css) {
		this.setState({ css });
	}

	renderDockContent() {
		return (
			<div>
				<Row className="mT-15">
					<Col xs={5} className={this.props.fromPanel ? 'u-padding-r10px' : ''}>
						<strong>Bottom XPath</strong>
					</Col>
					<Col xs={7} className={this.props.fromPanel ? 'u-padding-l10px' : ''}>
						<input
							className="inputMinimal"
							type="text"
							style={{ width: '100%' }}
							name="bottomXPath"
							value={this.state.bottomXPath}
							onChange={ev => {
								this.setState({ bottomXPath: ev.target.value });
							}}
						/>
					</Col>
				</Row>
				<Row className="mT-15">
					<Col xs={5} className={this.props.fromPanel ? 'u-padding-r10px' : ''}>
						<strong>Bottom Offset</strong>
					</Col>
					<Col xs={7} className={this.props.fromPanel ? 'u-padding-l10px' : ''}>
						<input
							className="inputMinimal"
							type="text"
							style={{ width: '100%' }}
							name="bottomOffset"
							value={this.state.bottomOffset}
							onChange={ev => {
								this.setState({ bottomOffset: ev.target.value });
							}}
						/>
					</Col>
				</Row>
				<Row className="mT-15">
					<Col xs={12} className={this.props.fromPanel ? 'u-padding-0px' : ''}>
						<CodeBox
							customId={`${this.props.section.id}interactiveAds`}
							showButtons={true}
							enableSave={true}
							textEdit
							code={this.state.css ? JSON.stringify(this.state.css) : ''}
							onSubmit={this.submitHandler}
							onCancel={this.props.onCancel}
							showNotification={this.props.showNotification}
						/>
					</Col>
				</Row>
			</div>
		);
	}

	render() {
		return (
			<div>
				<Col xs={12} className="u-padding-0px">
					<CustomToggleSwitch
						labelText="Make Docked"
						className="mB-10"
						checked={this.state.docked}
						onChange={val => {
							this.setState({ docked: !!val }, () => {
								this.props.onSetSectionType(this.props.section.id, val ? 4 : 1);
							});
						}}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout={this.props.fromPanel ? false : true}
						name={
							this.props.section && this.props.section.id
								? `dockedSwitch-${this.props.section.id}`
								: 'dockedSwitch'
						}
						id={
							this.props.section && this.props.section.id
								? `js-docked-switch-${this.props.section.id}`
								: 'js-docked-switch'
						}
						customComponentClass={this.props.fromPanel ? 'u-padding-0px' : ''}
					/>
					{this.state.docked ? (
						this.renderDockContent()
					) : (
						<CustomButton label="Back" handler={this.props.onCancel} />
					)}
				</Col>
			</div>
		);
	}
}

export default DockedSettings;
