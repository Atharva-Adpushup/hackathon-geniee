/* eslint-disable no-alert */
import React from 'react';
import { BACKUP_ADS_FORMATS } from '../../../configs/commonConsts';
import axiosInstance from '../../../../../helpers/axiosInstance';
import CopyButtonWrapperContainer from '../../../../../Containers/CopyButtonWrapperContainer';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../../Components/CustomButton/index';
import Loader from '../../../../../Components/Loader/index';
import CustomMessage from '../../../../../Components/CustomMessage/index';

const DEFAULT_STATE = {
	code: '',
	format: 'js',
	loading: false,
	url: '',
	siteDomain: ''
};

class Content extends React.Component {
	constructor(props) {
		super(props);
		const {
			site: { siteDomain }
		} = props;
		this.state = { ...DEFAULT_STATE, siteDomain };
	}

	static getDerivedStateFromProps(props, state) {
		if (props.site.siteDomain !== state.siteDomain) {
			return { ...DEFAULT_STATE, siteDomain: props.site.siteDomain };
		}
		return null;
	}

	resetHandler = () => {
		this.setState({
			...DEFAULT_STATE
		});
	};

	handleSelectChange = (value, key = 'format') => {
		this.setState(state => ({
			...state,
			[key]: value
		}));
	};

	handleChange = event => {
		const { value } = event.target;
		this.setState(state => ({
			...state,
			code: value
		}));
	};

	handleSave = () => {
		const {
			site: { siteId },
			showNotification
		} = this.props;
		const { code, format } = this.state;
		let isSomethingWrong = !code || !code.trim().length;
		let encodedCode;

		try {
			encodedCode = window.btoa(code);
		} catch (e) {
			isSomethingWrong = true;
		}

		if (isSomethingWrong) {
			return showNotification({
				mode: 'error',
				title: 'Operation Failed',
				message: 'Please check pasted code',
				autoDismiss: 5
			});
		}

		this.setState({ loading: true });

		return axiosInstance
			.post('/data/createBackupAd', {
				siteId,
				content: encodedCode,
				format
			})
			.then(response => {
				const { data } = response;

				return this.setState({
					url: data.data.url
				});
			})
			.finally(() => this.setState({ loading: false }));
	};

	renderUrlBox = () => {
		const { url } = this.state;
		return (
			<div className="u-margin-v3">
				<CustomMessage
					header="Information"
					type="info"
					message={`Code can be access via the following url -- <strong>${url}</strong>`}
				/>
				<CustomButton
					variant="primary"
					className="u-margin-t3 pull-right"
					onClick={this.resetHandler}
				>
					Create More
				</CustomButton>
				<CopyButtonWrapperContainer content={url} className="u-margin-t3 u-margin-r3 pull-right">
					<CustomButton variant="secondary">Copy Url</CustomButton>
				</CopyButtonWrapperContainer>
			</div>
		);
	};

	render() {
		const { site } = this.props;
		const { siteId, siteDomain } = site;
		const { code, format, loading, url } = this.state;

		if (loading) return <Loader height="250px" />;
		if (url) return this.renderUrlBox();

		return (
			<div className="u-margin-v4">
				<FieldGroup
					id={`input-${siteId}-${siteDomain}`}
					label="Backup Code"
					type="text"
					name={`input-${siteId}-${siteDomain}`}
					placeholder="Backup Code"
					className="u-padding-v3 u-padding-h3"
					onChange={this.handleChange}
					value={code}
					componentClass="textarea"
					style={{ minHeight: '200px' }}
				/>
				<FieldGroup
					name="format"
					value={format}
					type="toggle-button-group"
					label="Output format"
					toggleGroupType="radio"
					onChange={this.handleSelectChange}
					size={6}
					dataKey="format"
					itemCollection={BACKUP_ADS_FORMATS}
					id={`format-select-${siteId}-${siteDomain}`}
					placeholder="Output Format"
					className="u-padding-v3 u-padding-h3"
				/>
				<CustomButton variant="primary" className="pull-right" onClick={this.handleSave}>
					Generate
				</CustomButton>
			</div>
		);
	}
}

export default Content;
