import React from 'react';
import RowColSpan from './helper/RowColSpan.jsx';
import commonConsts from '../lib/commonConsts';
import Menu from '../../Editor/components/shared/menu/menu.jsx';
import MenuItem from '../../Editor/components/shared/menu/menuItem.jsx';
import MarginEditor from './helper/marginEditor.jsx';
import ColorEditor from './helper/colorEditor.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';

class SelectorSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectors: props.selectors
		};
	}

	saveSelectorCss = (key, css, index) => {
		let selectors = this.state.selectors;
		if (Array.isArray(selectors[key])) selectors[key][index].css = css;
		else selectors[key].css = css;
		this.setState({
			selectors
		});
	};
	onSelectorGlassClick = (key, index) => {
		let selectors = this.state.selectors;
		if (Array.isArray(selectors[key])) selectors[key][index].isVisible = false;
		else selectors[key].isVisible = false;
		this.setState({
			selectors
		});
	};

	renderSelector = key => {
		let selectorConf = commonConsts.pagegroupSelectors,
			selectorValue = (this.state.selectors[key] && this.state.selectors[key].value) || '';
		return (
			<RowColSpan label={selectorConf[key].alias} key={key}>
				<input
					onChange={e => {
						let selectors = this.state.selectors;
						selectors[e.target.name] = selectors[e.target.name] || {};
						selectors[e.target.name].value = e.target.value;
						this.setState({
							selectors
						});
					}}
					className="blockListInput"
					type="text"
					name={key}
					defaultValue={selectorValue}
				/>
				<button
					className="fa fa-code blockListDelete mL-10"
					type="button"
					onClick={() => {
						let selectors = this.state.selectors;
						selectors[key] = selectors[key] || {};
						selectors[key].isVisible = true;
						this.setState({
							selectors
						});
					}}
				/>
				{this.state.selectors[key] && this.state.selectors[key].isVisible
					? <Menu
							id="channelMenu"
							position={{ top: 43 }}
							arrow="none"
							onGlassClick={() => this.onSelectorGlassClick(key)}
						>
							<MenuItem icon={'fa fa-th'} contentHeading="" key={1}>
								<MarginEditor
									css={this.state.selectors[key] && this.state.selectors[key].css}
									onCancel={() => this.onSelectorGlassClick(key)}
									handleSubmit={css => this.saveSelectorCss(key, css)}
								/>
							</MenuItem>
							<MenuItem icon={'fa fa-pencil'} contentHeading="" key={2}>
								<ColorEditor
									css={this.state.selectors[key] && this.state.selectors[key].css}
									onCancel={() => this.onSelectorGlassClick(key)}
									handleSubmit={css => this.saveSelectorCss(key, css)}
								/>
							</MenuItem>

						</Menu>
					: ''}

			</RowColSpan>
		);
	};

	renderArraySelector = (key, index) => {
		let selectorValue = (this.state.selectors[key][index] && this.state.selectors[key][index].value) || '';
		return (
			<div key={index} className="mB-5">
				<input
					onChange={e => {
						let selectors = this.state.selectors;
						selectors[key][index].value = e.target.value;
						this.setState({
							selectors
						});
					}}
					className="selectorInput"
					type="text"
					name={key}
					defaultValue={selectorValue}
				/>
				<button
					className="fa fa-trash selectorDelete mL-10"
					type="button"
					onClick={() => {
						let selectors = this.state.selectors;
						selectors[key].splice(index, 1);
						this.setState({
							selectors
						});
					}}
				/>
				<button
					className="fa fa-code selectorDelete mL-10"
					type="button"
					onClick={() => {
						let selectors = this.state.selectors;
						selectors[key][index].isVisible = true;
						this.setState({
							selectors
						});
					}}
				/>

				{this.state.selectors[key] && this.state.selectors[key][index].isVisible
					? <Menu
							id="channelMenu"
							position={{ top: 43 }}
							arrow="none"
							onGlassClick={() => this.onSelectorGlassClick(key, index)}
						>
							<MenuItem icon={'fa fa-th'} contentHeading="" key={1}>
								<MarginEditor
									css={this.state.selectors[key][index] && this.state.selectors[key][index].css}
									onCancel={() => this.onSelectorGlassClick(key, index)}
									handleSubmit={css => this.saveSelectorCss(key, css, index)}
								/>
							</MenuItem>
							<MenuItem icon={'fa fa-pencil'} contentHeading="" key={2}>
								<ColorEditor
									css={this.state.selectors[key][index] && this.state.selectors[key][index].css}
									onCancel={() => this.onSelectorGlassClick(key, index)}
									handleSubmit={css => this.saveSelectorCss(key, css, index)}
								/>
							</MenuItem>

						</Menu>
					: ''}

			</div>
		);
	};

	render() {
		let selectorConf = commonConsts.pagegroupSelectors;
		return (
			<CollapsePanel title="Selector Setting" className="mediumFontSize" noBorder={true}>
				{Object.keys(selectorConf).map(key => {
					if (selectorConf[key].inputType == 'text') {
						return this.renderSelector(key);
					} else {
						return (
							<RowColSpan label={selectorConf[key].alias} key={key}>
								{this.state.selectors[key] &&
									this.state.selectors[key].map((value, index) =>
										this.renderArraySelector(key, index)
									)}
								<button
									className="btn-primary addButton"
									type="button"
									onClick={() => {
										let selectors = this.state.selectors;
										selectors[key] = selectors[key] || [];
										selectors[key].push({});
										this.setState({ selectors });
									}}
								>
									+ Add
								</button>
							</RowColSpan>
						);
					}
				})}
			</CollapsePanel>
		);
	}
}

export default SelectorSettings;
