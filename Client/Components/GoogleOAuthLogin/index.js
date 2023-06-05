import React, { useEffect, useRef } from 'react';
import moment from 'moment';

import {
	GOOGLE_APP_API_KEY,
	GOOGLE_OAUTH_CLIENT_ID,
	REPORT_EXPORT
} from '../../../configs/commonConsts';
import CustomButton from '../CustomButton';

const { SCOPES, DISCOVERY_DOC, API_LIB, GSI_LIB } = REPORT_EXPORT;
const w = window;

const useLoadExternalScript = (src, onLoad, isLoaded) => {
	useEffect(() => {
		if (!isLoaded) {
			const script = document.createElement('script');

			script.src = src;

			script.async = true;
			if (src === API_LIB) {
				script.crossOrigin = true;
			}
			script.onload = onLoad;

			document.body.appendChild(script);
			return () => {
				// clean up the script when the component in unmounted
				document.body.removeChild(script);
			};
		}
	}, [src, onLoad, isLoaded]);
};

const GoogleLoginButton = ({ selectedControlsForCSV = [], csvData, ...props }) => {
	const tokenClient = useRef('');
	const gapiInited = useRef(false);
	const gisInited = useRef(false);

	/**
	 * Callback after the API client is loaded. Loads the
	 * discovery doc to initialize the API.
	 */
	async function initializeGapiClient() {
		try {
			if (!gapiInited.current) {
				await w.gapi.client.init({
					apiKey: GOOGLE_APP_API_KEY,
					discoveryDocs: [DISCOVERY_DOC]
				});
				gapiInited.current = true;
			}
		} catch (err) {
			console.log('GAPI init failed', err);
		}
	}

	/**
	 * Callback after api.js is loaded.
	 */
	const gapiLoaded = () => {
		w.gapi.load('client', initializeGapiClient);
	};

	/**
	 * Callback after Google Identity Services are loaded.
	 */
	function gisLoaded() {
		// eslint-disable-next-line no-undef
		tokenClient.current = google.accounts.oauth2.initTokenClient({
			client_id: GOOGLE_OAUTH_CLIENT_ID,
			scope: SCOPES,
			callback: '' // defined later
		});
		gisInited.current = true;
	}

	async function generateReport(name = 'Console-Report') {
		let response;
		try {
			const title = `${name}-${moment().format('MM-DD-YYYY')}`;
			response = await w.gapi.client.sheets.spreadsheets.create({
				properties: {
					title
				}
			});

			let sheetData = [];
			if (selectedControlsForCSV.length) {
				sheetData = [...selectedControlsForCSV, [], ...csvData];
			} else {
				sheetData = csvData;
			}
			const charFromColumnIndex = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
			const cols = charFromColumnIndex[csvData[0].length];
			const rows = sheetData.length;

			await w.gapi.client.sheets.spreadsheets.values.update({
				spreadsheetId: response.result.spreadsheetId,
				range: `A1:${cols}${rows}`,
				valueInputOption: 'USER_ENTERED',
				values: sheetData
			});
		} catch (err) {
			console.log('Generate report failed', err);
			tokenClient.current.requestAccessToken({ prompt: '' });
		}

		return response.result.spreadsheetUrl;
	}
	const downloadReport = async () => {
		try {
			const sheetURL = await generateReport();
			window.open(sheetURL, '_blank');
		} catch (err) {
			console.log('Auth failed: ', err);
		}
	};

	/**
	 *  Sign in the user upon button click.
	 */
	const handleAuthClick = () => {
		if (gapiInited.current && gisInited.current) {
			tokenClient.current.callback = async resp => {
				if (resp.error) {
					console.log('Auth failed: ', resp.error);
				} else {
					downloadReport();
				}
			};

			if (w.gapi.client.getToken() === null) {
				// Prompt the user to select a Google Account and ask for consent to share their data
				// when establishing a new session.
				tokenClient.current.requestAccessToken();
			} else {
				// Skip display of account chooser and consent dialog for an existing session.
				downloadReport();
			}
		}
	};

	useLoadExternalScript(API_LIB, gapiLoaded, gapiInited.current);
	useLoadExternalScript(GSI_LIB, gisLoaded, gisInited.current);
	return (
		<CustomButton {...props} onClick={handleAuthClick}>
			Export To Google Sheet
		</CustomButton>
	);
};

export default GoogleLoginButton;
