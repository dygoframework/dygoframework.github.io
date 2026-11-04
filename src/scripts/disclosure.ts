// Buttons with data-disclosure show or hide the element named by aria-controls.
document.addEventListener('click', (event) => {
	const button = (event.target as Element | null)?.closest<HTMLButtonElement>('button[data-disclosure]');
	const panel = button && document.getElementById(button.getAttribute('aria-controls') ?? '');
	if (!button || !panel) return;
	const open = button.getAttribute('aria-expanded') !== 'true';
	button.setAttribute('aria-expanded', String(open));
	panel.hidden = !open;
});
