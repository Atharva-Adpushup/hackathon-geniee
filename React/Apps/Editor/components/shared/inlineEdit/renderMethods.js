// Inline edit render methods

import { Row, Button, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import MiniDropdown from '../miniDropdown/index.jsx';

const renderDropdownList = that => {
		return (
			<MiniDropdown
				showDropdown
				dropDownItems={that.props.dropdownList}
				selectHandler={that.selectDropdownValue}
				context={that}
			/>
		);
	},
	renderActionButtons = that => {
		return that.props.compact ? (
			<div>
				<Col className="u-padding-r5px" xs={8}>
					<Button
						disabled={that.state.disableSave}
						onClick={that.submitValue.bind(that)}
						className="btn-lightBg btn-save btn-block btn btn-default"
					>
						Save
					</Button>
				</Col>
				<Col className="u-padding-r10px " xs={4}>
					<Button
						onClick={that.cancelEdit.bind(that)}
						className="btn-lightBg btn-cancel btn-ie-cancel btn-block btn btn-default"
					/>
				</Col>
			</div>
		) : (
			<div>
				<Col className="u-padding-r5px" xs={4}>
					<Button
						onClick={that.submitValue.bind(that)}
						className="btn-lightBg btn-save btn-block btn btn-default"
					>
						Save
					</Button>
				</Col>
				<Col className="u-padding-r10px " xs={2}>
					<Button
						onClick={that.cancelEdit.bind(that)}
						className="btn-lightBg btn-cancel btn-ie-cancel btn-block btn btn-default"
					/>
				</Col>
			</div>
		);
	},
	renderNormalMode = (that, adCodeStyles, adCodeEdit, rootClassNames) => {
		const valueStyle = { fontWeight: that.props.font ? that.props.font : 700, wordBreak: 'break-all' };
		return (
			<div className={rootClassNames}>
				<strong style={valueStyle}>
					{that.props.value ? (
						<span style={that.props.adCode ? adCodeStyles : {}}>
							{' '}
							{that.props.adCode ? atob(that.props.value) : that.props.value}{' '}
						</span>
					) : (
						`Edit ${that.props.text}`
					)}
				</strong>
				{that.props.text ? (
					<OverlayTrigger
						placement="bottom"
						overlay={<Tooltip id="edit-variation-tooltip">Edit {that.props.text}</Tooltip>}
					>
						<button
							style={that.props.adCode ? adCodeEdit : {}}
							onClick={that.triggerEdit.bind(that)}
							className="btn-icn-edit"
						/>
					</OverlayTrigger>
				) : (
					<button onClick={that.triggerEdit.bind(that)} className="btn-icn-edit" />
				)}
			</div>
		);
	},
	renderInlineEditPanel = (that, colCompact, adCodeStyles, adCodeEdit, adCodeCheck, rootClassNames, showTextarea) => {
		const inlineInputStyles = {
				width: '100%',
				padding: '3.5px 10px',
				borderRadius: '3px',
				border: '1px solid #ccc'
			},
			inputType = that.props.type || 'text';

		return (
			<div className={rootClassNames}>
				{that.state.editMode ? (
					<div>
						<Row style={{ margin: 0 }}>
							<Col className="u-padding-r10px" xs={colCompact} style={{ position: 'relative' }}>
								{showTextarea ? (
									<textarea
										style={Object.assign(inlineInputStyles, { height: '50px', resize: 'none' })}
										type={inputType}
										ref="editedText"
										placeholder={that.props.text}
										defaultValue={adCodeCheck}
										onKeyUp={that.props.keyUpHandler ? that.keyUp.bind(that) : () => {}}
										onFocus={that.props.changeHandler ? that.changeValue.bind(that) : () => {}}
										onChange={that.props.changeHandler ? that.changeValue.bind(that) : () => {}}
									/>
								) : (
									<input
										style={inlineInputStyles}
										type={inputType}
										ref="editedText"
										placeholder={that.props.text}
										defaultValue={adCodeCheck}
										onKeyUp={that.props.keyUpHandler ? that.keyUp.bind(that) : () => {}}
										onFocus={that.props.changeHandler ? that.changeValue.bind(that) : () => {}}
										onChange={that.props.changeHandler ? that.changeValue.bind(that) : () => {}}
									/>
								)}
								{that.state.showDropdownList ? that.renderDropdownList() : null}
								<span className="error-message">
									{that.state.inputError
										? that.props.validationError
											? that.props.validationError
											: that.props.errorMessage
										: ''}
								</span>
							</Col>
							{that.renderActionButtons()}
						</Row>
					</div>
				) : (
					that.renderNormalMode(adCodeStyles, adCodeEdit, rootClassNames)
				)}
			</div>
		);
	};

export { renderDropdownList, renderActionButtons, renderNormalMode, renderInlineEditPanel };
