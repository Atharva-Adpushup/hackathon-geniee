/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { useState } from 'react';

import { useCSVReader, lightenDarkenColor } from 'react-papaparse';

const GREY = '#CCC';
const DEFAULT_REMOVE_HOVER_COLOR = '#A01919';
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(DEFAULT_REMOVE_HOVER_COLOR, 40);
const GREY_DIM = '#686868';

const styles = {
	main: { height: '50px', width: '100%' },
	zone: {
		alignItems: 'center',
		borderWidth: 2,
		borderColor: GREY,
		borderRadius: 10,
		display: 'flex',
		flexDirection: 'column',
		height: '100%',
		justifyContent: 'center',
		textAlign: 'center',
		background: '#eb575c',
		color: 'white',
		padding: '0 10px',
		width: '100%'
	},
	file: {
		background: '#eb575c',
		borderRadius: 10,
		display: 'flex',
		height: '50px',
		width: '100%',
		position: 'relative',
		zIndex: 10,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	info: {
		alignItems: 'center',
		display: 'flex',
		flexDirection: 'column',
		paddingLeft: 10,
		paddingRight: 10
	},
	size: {
		borderRadius: 3,
		marginBottom: '0.5em',
		justifyContent: 'center',
		display: 'flex'
	},
	name: {
		borderRadius: 3,
		fontSize: 12,
		marginBottom: '0.5em'
	},
	progressBar: {
		position: 'absolute',
		width: '80%',
		paddingLeft: '10%',
		paddingRight: '10%',
		bottom: 8
	},
	zoneHover: {
		borderColor: GREY_DIM
	},
	default: {
		borderColor: GREY
	},
	remove: {
		height: 23,
		position: 'absolute',
		right: -15,
		top: -5,
		width: 23
	}
};

export default function CSVReaderComponent(props) {
	const { onFileLoadedSuccess, uploadedBlockListedCsv, onFileRemoved, message } = props;
	const { CSVReader } = useCSVReader();
	const [zoneHover, setZoneHover] = useState(false);
	const [removeHoverColor, setRemoveHoverColor] = useState(DEFAULT_REMOVE_HOVER_COLOR);

	return (
		<div style={styles.main}>
			<CSVReader
				onUploadAccepted={results => {
					const { data = [] } = results;
					const requiredRows = data.slice(1);
					onFileLoadedSuccess(requiredRows);
					setZoneHover(false);
				}}
				onDragOver={event => {
					event.preventDefault();
					setZoneHover(true);
				}}
				onDragLeave={event => {
					event.preventDefault();
					setZoneHover(false);
				}}
			>
				{({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, Remove }) => (
					<>
						<div
							{...getRootProps()}
							style={Object.assign({}, styles.zone, zoneHover && styles.zoneHover)}
						>
							{acceptedFile && uploadedBlockListedCsv !== null ? (
								<>
									<div style={styles.file}>
										<div style={styles.info}>
											<span style={styles.name}>{acceptedFile.name}</span>
										</div>
										<div style={styles.progressBar}>
											<ProgressBar />
										</div>
										<div
											{...getRemoveFileProps()}
											style={styles.remove}
											onMouseOver={event => {
												event.preventDefault();
												setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
											}}
											onMouseOut={event => {
												event.preventDefault();
												setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
											}}
											onMouseDown={onFileRemoved}
										>
											<Remove color={removeHoverColor} />
										</div>
									</div>
								</>
							) : (
								message
							)}
						</div>
					</>
				)}
			</CSVReader>
		</div>
	);
}
