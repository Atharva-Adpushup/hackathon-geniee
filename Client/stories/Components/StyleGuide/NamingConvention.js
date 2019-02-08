import React from 'react';

const NamingConvention = () => (
	<div className="container-fluid">
		<h1 className="u-margin-b4">Frontend Class Naming Convention</h1>
		<p>
			This is an HTML class naming convention pattern developed to create semantic, scalable and
			reusable Front-end architecture.
		</p>
		<p>
			It is a combination of <b>MODIFIED B.E.M.</b> pattern by Nicolas Gallagher written at &nbsp;
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="http://nicolasgallagher.com/about-html-semantics-front-end-architecture/"
			>
				About Html Semantics and Front-end Architecture
			</a>
			&nbsp;and flex-box library pattern used in SOLVED BY FLEXBOX demos by Philip Walton written at
			&nbsp;
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://philipwalton.github.io/solved-by-flexbox/"
			>
				Solved By Flexbox
			</a>
			&nbsp;
		</p>

		<div className="panel panel-info u-margin-t4 u-margin-b4">
			<div className="panel-heading">
				<h3>MODIFIED BEM (Block-Element—Modifier) technique</h3>
			</div>
			<div className="panel-body">
				<pre>
					/****** Utility *****/ .u-utilityName {} (For example, u-margin-0px, u-padding-t10px,
					u-text-bold, u-shadow-none, u-margin-b15px)
				</pre>

				<pre>
					/****** Component *****/ .ComponentName {} (For example, .site, .page, .panel, .list,
					.form, .nav, .button, .link)
				</pre>

				<pre>
					/****** Component modifier *****/ .ComponentName--modifierName {} (For example,
					.site—theme-light, .site-header—sub, .list-group—theme-dark, .jumbotron—size-xs,
					.button--cta)
				</pre>

				<pre>
					/****** Component descendant *****/ .ComponentName-descendant {} (For example,
					.site-header, .site-footer, .site-content, .page-content, .list-item, .panel-body,
					.panel-heading)
				</pre>

				<pre>
					/****** Component descendant modifier *****/ .ComponentName-descendant--modifierName {}{' '}
					(For example, .button-icon—transparent, .nav-link—theme-secondary, .list-group—size-xs,
					.jumbotron-thumbnail—hero)
				</pre>

				<pre>
					/****** Component state (scoped to component) *****/ .ComponentName.is-stateOfComponent {}{' '}
					(For example, .button.is-hovered, .form-control.is-focused, .link.is-visited,
					.link.is-active)
				</pre>
			</div>
		</div>

		<div className="panel panel-info u-margin-t4 u-margin-b4">
			<div className="panel-heading">
				<h3>Utility Classes</h3>
			</div>
			<div className="panel-body">
				<pre>
					/***** JS HOOKS *****/ .js-ComponentSpecificClassName (For example, .js-slideout-menu,
					.js-filter-selected-wrapper, .js-slideout-panel, .js-reports-wrapper, .js-filter-btn) -
					Prefixed with js- for JS hooks
				</pre>
			</div>
		</div>
	</div>
);

export default NamingConvention;
