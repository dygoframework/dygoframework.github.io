// Enterprise page content.
//
// PLAN.md section 5: the services, team support, workshops and the "people
// who build Dygo" wording were drafts until Dylan confirmed them (2026-11-04,
// in review of the Phase 4 PR). With `confirmed` false, production builds
// leave the `drafts` below out; dev and test builds always show them.

export const confirmed = true;

export const hero = {
	eyebrow: 'Dygo Enterprise',
	titleLines: ['Run Dygo with', 'expert support.'],
	action: { label: 'Get in touch', href: '#contact' },
};

export const drafts = {
	heroLead: 'Work directly with the people who build Dygo to design, secure and tune your Go services.',
	services: {
		title: 'Help where your team needs it.',
		lead: 'Bring us in for one review or for ongoing support across a project.',
		items: [
			{ title: 'Architecture reviews', description: 'Check your module boundaries, data flow and service design.' },
			{ title: 'Security reviews', description: 'Review your auth, access rules and production settings.' },
			{ title: 'Performance tuning', description: 'Find bottlenecks and measure each improvement.' },
			{ title: 'Code reviews', description: 'Get detailed feedback on the changes that matter most.' },
			{ title: 'Team mentoring', description: 'Help your engineers become confident with Dygo.' },
			{ title: 'Upgrade support', description: 'Plan and complete moves to new Dygo releases.' },
		],
	},
	panels: [
		{ id: 'risk', title: 'Reduce security risk.', lead: 'Check your app against the OWASP Top 10 and cover what the framework leaves to your code.' },
		{ id: 'speed', title: 'Stay fast in production.', lead: 'Benchmark real endpoints, find the slowest paths and prepare for heavy load.' },
	],
	offers: [
		{ title: 'Team support', description: 'Work alongside your engineers on a project, from planning through launch.' },
		{ title: 'Workshops', description: 'Run hands-on sessions on architecture, security, testing and performance.' },
	],
};

export const contact = {
	title: "Tell us what you're building.",
	lead: "Leave your work email and we'll get back to you.",
	privacy: 'We only use your email to reply to you.',
	success: "Thanks. We'll reply by email.",
	error: "Sorry, your message didn't send. Please try again, or write to us on GitHub.",
};

/** Drafts show in dev and test builds, and in production only once confirmed. */
export const showDrafts = confirmed || process.env.INCLUDE_DEV_PAGES === 'true';
