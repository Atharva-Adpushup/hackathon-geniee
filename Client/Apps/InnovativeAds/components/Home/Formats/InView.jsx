/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-alert */
import React, { Component } from 'react';
import CodeBox from '../../../../../Components/CodeBox/index';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import { TYPE_OF_ADS, EVENTS } from '../../../configs/commonConsts';
import CustomMessage from '../../../../../Components/CustomMessage';
import CustomInput from '../../shared/index';

/*
	Checking if for the selected page groups there exists
	an inView ad with same xpath configuration
*/
const getPagegroupsWithDuplicateAds = (xpath, selectedPagegroups, existingInviewAds) => {
	let duplicates = [];

	if (!!xpath && !!existingInviewAds.length) {
		duplicates = selectedPagegroups.filter(pg =>
			existingInviewAds.some(ad => ad === `${xpath}-${pg}`)
		);
	}

	return duplicates;
};

class InView extends Component {
	constructor(props) {
		super(props);
		const { ad = false, currentInviewAds = [] } = this.props;

		const existingInviewAds = currentInviewAds.reduce((ads, ad) => {
			const { archivedOn, formatData, pagegroups } = ad;
			if (archivedOn) return ads;

			const pagegroupAds = pagegroups.map(pg => `${formatData.eventData.value}-${pg}`);
			return ads.concat(pagegroupAds);
		}, []);

		const hasFormatData = !!(ad && ad.formatData);
		this.state = {
			existingInviewAds,
			pagegroupsWithDuplicateAds: [],
			xpath: hasFormatData && ad.formatData.eventData ? ad.formatData.eventData.value : '',
			css: ad && ad.css ? window.btoa(JSON.stringify(ad.css)) : ''
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleCodeChange = this.handleCodeChange.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
	}

	static getDerivedStateFromProps(props, state) {
		if (props.selectedPagegroups !== state.selectedPagegroups) {
			const { xpath, existingInviewAds } = state;
			const pagegroupsWithDuplicateAds = getPagegroupsWithDuplicateAds(
				xpath,
				props.selectedPagegroups,
				existingInviewAds
			);
			return { pagegroupsWithDuplicateAds };
		}
		return null;
	}

	handleChange(e) {
		const name = e.target.name;
		const value = e.target.value;

		const { existingInviewAds } = this.state;
		const { selectedPagegroups } = this.props;

		const pagegroupsWithDuplicateAds = getPagegroupsWithDuplicateAds(
			value,
			selectedPagegroups,
			existingInviewAds
		);

		this.setState({
			[name]: value,
			pagegroupsWithDuplicateAds
		});
	}

	handleCodeChange(css) {
		this.setState({ css: window.btoa(css) });
	}

	saveHandler(e) {
		e.preventDefault();
		const { xpath, css } = this.state;
		const { save } = this.props;
		let parsedCSS = {};
		if (!xpath) {
			return window.alert('Xpath is mandatory field');
		}
		if (css && css.trim().length) {
			try {
				parsedCSS = JSON.parse(window.atob(css));
			} catch (err) {
				return window.alert('Invalid CSS');
			}
		}
		return save.handler({
			formatData: {
				event: EVENTS.SCROLL,
				eventData: {
					value: xpath
				}
			},
			css: parsedCSS,
			type: TYPE_OF_ADS.INTERACTIVE_AD
		});
	}

	render() {
		const { save, cancel } = this.props;
		const { xpath, css, pagegroupsWithDuplicateAds } = this.state;
		const hasPagegroupsWithDuplicateAds = !!pagegroupsWithDuplicateAds.length;
		const formattedPagegroupsWithDuplicateAds = pagegroupsWithDuplicateAds
			.map(pg => pg.replace(':', ' - '))
			.join(', ');

		return (
			<div>
				<Row>
					<form action="#" method="POST">
						<CustomInput
							name="xpath"
							value={xpath}
							type="text"
							label="Enter Xpath"
							handler={this.handleChange}
							size={12}
							id="xpath-input"
						/>
						<Col md={12} style={{ paddingLeft: '0px' }}>
							<label htmlFor="css">Custom CSS</label>
							<CodeBox name="css" showButtons={false} onChange={this.handleCodeChange} code={css} />
						</Col>
						{!hasPagegroupsWithDuplicateAds && save.renderFn(save.label, this.saveHandler)}
						{cancel ? cancel.renderFn(cancel.label, cancel.handler, 'secondary') : null}
					</form>
				</Row>
				{hasPagegroupsWithDuplicateAds && (
					<div className="u-margin-v5">
						<CustomMessage
							message={`An inview ad for xpath <strong>'${xpath}'</strong> already exists for <strong>'${formattedPagegroupsWithDuplicateAds}'</strong>. Please archive the existing ad before creating a new one.`}
							className="error"
							header="Similar InView Ad already exists"
							key={1}
						/>
					</div>
				)}
			</div>
		);
	}
}

export default InView;
