import React from 'react';

const Welcome = () => (
	<div className="container-fluid">
		<h1>Welcome to AdPushup-Storybook</h1>
		<p>An interactive UI development environment for new SPA.</p>

		<div className="panel panel-primary u-margin-t4">
			<div className="panel-heading">Table Of Contents</div>

			<ul className="list-group">
				<li className="list-group-item">
					<div className="panel panel-info">
						<div className="panel-heading">UI Style Guide</div>
						<ul className="list-group">
							<li className="list-group-item">
								Front-end naming convention & Utility classNames (Layout specific like Flexbox,
								Padding, Margin, Block level)
							</li>
							<li className="list-group-item">Color, Type & zIndex Theme</li>
						</ul>
					</div>
				</li>

				<li className="list-group-item">
					<div className="panel panel-info">
						<div className="panel-heading">UI Components (React)</div>
						<ul className="list-group">
							<li className="list-group-item">Loader</li>
							<li className="list-group-item">Sidebar</li>
						</ul>
					</div>
				</li>
			</ul>
		</div>
	</div>
);

export default Welcome;
