// Inline edit render methods

import { Row, Button, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

const renderDropdownList = that => {
	return (
		<div className="inline-dropdown-wrapper">
			<button onClick={that.hideDropdown.bind(that)}>x</button>
			<ul className="inline-dropdown" style={(that.props.dropdownList && that.props.dropdownList.length > 3) ? { overflowY: 'scroll', overflowX: 'hidden' } : {}}>
				{
					that.props.dropdownList.map((xpath, key) => (
						<li onClick={that.selectDropdownValue.bind(that, xpath)} key={key}>
							{xpath}
						</li>
					))
				}
			</ul>
		</div>
	);
},
	renderActionButtons = that => {
		return (
			that.props.compact ? (
				<div>
					<Col className="u-padding-r5px" xs={8}>
						<Button disabled={that.state.disableSave} onClick={that.submitValue.bind(that)} className="btn-lightBg btn-save btn-block btn btn-default">Save</Button>
					</Col>
					<Col className="u-padding-r10px " xs={4}>
						<Button onClick={that.cancelEdit.bind(that)} className="btn-lightBg btn-cancel btn-ie-cancel btn-block btn btn-default"></Button>
					</Col>
				</div>
			) : (
					<div>
						<Col className="u-padding-r5px" xs={4}>
							<Button onClick={that.submitValue.bind(that)} className="btn-lightBg btn-save btn-block btn btn-default">Save</Button>
						</Col>
						<Col className="u-padding-r10px " xs={2}>
							<Button onClick={that.cancelEdit.bind(that)} className="btn-lightBg btn-cancel btn-ie-cancel btn-block btn btn-default"></Button>
						</Col>
					</div>
				)
		);
	},
	renderNormalMode = (that, adCodeStyles, adCodeEdit) => {
		const valueStyle = { fontWeight: that.props.font ? that.props.font : 700, wordBreak: 'break-all' };
		return (
			<div>
				<strong style={valueStyle}>{
					that.props.value ? (
						<span style={that.props.adCode ? adCodeStyles : {}}> {that.props.adCode ? atob(that.props.value) : that.props.value} </span>
					) : `Edit ${that.props.text}`
				}</strong>
				{
					that.props.text ? (
						<OverlayTrigger placement="bottom" overlay={<Tooltip id="edit-variation-tooltip">Edit {that.props.text}</Tooltip>}>
							<button style={that.props.adCode ? adCodeEdit : {}} onClick={that.triggerEdit.bind(that)} className="btn-icn-edit"></button>
						</OverlayTrigger>
					) : <button onClick={that.triggerEdit.bind(that)} className="btn-icn-edit"></button>
				}
			</div>
		);
	},
	renderInlineEditPanel = (that, colCompact, adCodeStyles, adCodeEdit, adCodeCheck) => {
		return (
			<div>
				{
					that.state.editMode ? (
						<Row style={{ margin: 0 }}>
							<Col className="u-padding-r10px" xs={colCompact} style={{ position: 'relative' }}>
								<input type="text" ref="editedText"
									placeholder={that.props.text}
									defaultValue={adCodeCheck}
									onKeyUp={that.props.keyUpHandler ? that.keyUp.bind(that) : () => { } }
									onFocus={that.props.changeHandler ? that.changeValue.bind(that) : () => { } }
									onChange={that.props.changeHandler ? that.changeValue.bind(that) : () => { } } />
								{
									that.state.showDropdownList ? (
										that.renderDropdownList()
									) : null
								}
								<span className="error-message">{that.state.inputError ? (that.props.validationError ? that.props.validationError : that.props.errorMessage) : ''}</span>
							</Col>
							{
								that.renderActionButtons()
							}
						</Row>
					) : (
							that.renderNormalMode(adCodeStyles, adCodeEdit)
						)
				}
			</div>
		);
	};

export { renderDropdownList, renderActionButtons, renderNormalMode, renderInlineEditPanel };