import './styles.scss';
const Tags = props => {
	let { labels } = props;
	labels = labels || [];
	if (!labels.length) {
		return null;
	}
	return (
		<ul className="tags">
			{labels.map(label => {
				return (
					<li>
						<a href="#" className="tag">
							{label}
						</a>
					</li>
				);
			})}
		</ul>
	);
};

export default Tags;
