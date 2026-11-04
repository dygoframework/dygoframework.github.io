// Build settings that must be right before the site goes live.

/** @param {Record<string, string | undefined>} env */
export function checkEnv(env) {
	if (env.DYGO_ENV !== 'production') return;
	if (!env.PUBLIC_CONTACT_FORM_URL) {
		throw new Error('PUBLIC_CONTACT_FORM_URL is required for a production build, so the Enterprise form has somewhere to send.');
	}
	if (!/^https:\/\//.test(env.PUBLIC_CONTACT_FORM_URL)) {
		throw new Error('PUBLIC_CONTACT_FORM_URL must be an https URL.');
	}
}
