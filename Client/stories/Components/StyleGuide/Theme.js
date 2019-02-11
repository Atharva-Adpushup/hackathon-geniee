import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

function LinkWithTooltip({ id, children, tooltip }) {
	return (
		<OverlayTrigger
			overlay={<Tooltip id={id}>{tooltip}</Tooltip>}
			placement="top"
			delayShow={300}
			delayHide={150}
		>
			{children}
		</OverlayTrigger>
	);
}

const Theme = () => (
	<div className="container-fluid">
		<style
			dangerouslySetInnerHTML={{
				__html: `.color-swatch { background: #fff; min-height: 100px; border-radius: 5px;}
					.color-swatch.color-swatch--primary { background: #eb575c; }
					.color-swatch.color-swatch--primary-dark-1 { background: #e62930; }
					.color-swatch.color-swatch--primary-dark-2 { background: #cf474b; }`
			}}
		/>
		<h1 className="u-margin-b4">Theme</h1>
		<p>Visual Representation of our theme settings.</p>

		<div className="panel panel-info u-margin-t4 u-margin-b4">
			<div className="panel-heading">
				<h3>Color</h3>
			</div>
			<div className="panel-body">
				<div className="row">
					<div className="col-sm-4 col-md-2 col-lg-2">
						<LinkWithTooltip
							id="tooltip-1"
							tooltip="Tip: Use as company brand color throught the product"
						>
							<div className="thumbnail u-border-none">
								<div className="color-swatch color-swatch--primary" />
								<div className="caption text-center">
									<h4>Primary</h4>
									<h5>
										<code>#eb575c</code>
									</h5>
								</div>
							</div>
						</LinkWithTooltip>
					</div>

					<div className="col-sm-4 col-md-2 col-lg-2">
						<LinkWithTooltip
							id="tooltip-2"
							tooltip="Tip: Use as hover transition state to primary color"
						>
							<div className="thumbnail u-border-none">
								<div className="color-swatch color-swatch--primary-dark-1" />
								<div className="caption text-center">
									<h4>Primary-Dark-1</h4>
									<h5>
										<code>#e62930</code>
									</h5>
								</div>
							</div>
						</LinkWithTooltip>
					</div>

					<div className="col-sm-4 col-md-2 col-lg-2">
						<LinkWithTooltip
							id="tooltip-3"
							tooltip="Tip: Use as primary color for icons, labels etc."
						>
							<div className="thumbnail u-border-none">
								<div className="color-swatch color-swatch--primary-dark-2" />
								<div className="caption text-center">
									<h4>Primary-Dark-2</h4>
									<h5>
										<code>#cf474b</code>
									</h5>
								</div>
							</div>
						</LinkWithTooltip>
					</div>
				</div>
			</div>
		</div>

		<div className="panel panel-info u-margin-t4 u-margin-b4">
			<div className="panel-heading">
				<h3>Font Size</h3>
			</div>
			<div className="panel-body" />
		</div>

		<div className="panel panel-info u-margin-t4 u-margin-b4">
			<div className="panel-heading">
				<h3>Spacing</h3>
			</div>
			<div className="panel-body" />
		</div>

		<div className="panel panel-info u-margin-t4 u-margin-b4">
			<div className="panel-heading">
				<h3>zIndex</h3>
			</div>
			<div className="panel-body" />
		</div>
	</div>
);

export default Theme;
