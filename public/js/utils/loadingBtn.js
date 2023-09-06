export const loadingBtn = (btn, status) => {
	// action = enable, disable
	if (status === 'disable') {
		btn.disabled = true;
		btn.textContent = 'Please wait...';
	} else if (status === 'enable') {
		btn.disabled = false;
		btn.textContent = 'Submit';
	}
};
