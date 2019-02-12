import React from 'react';

const Tags = props => {
	const { labels = [] } = props;
	if (!labels.length) {
		return null;
	}
	return (
		<ul className="tags">
			{labels.map((label, key) => (
				<li key={key}>
					<a href="#" className="tag">
						{label}
					</a>
				</li>
			))}
		</ul>
	);
};

export default Tags;
