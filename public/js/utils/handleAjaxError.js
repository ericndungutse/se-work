import { showAlert } from './alert';

export const handleError = err => {
	if (err.response) {
		/*
		 * The request was made and the server responded with a
		 * status code that falls out of the range of 2xx
		 */
		showAlert('error', err.response.data.message);
	} else if (err.request) {
		/*
		 * The request was made but no response was received, `error.request`
		 * is an instance of XMLHttpRequest in the browser and an instance
		 * of http.ClientRequest in Node.js
		 */

		showAlert(
			'error',
			'Something went wrong! It might be unstable network connection.'
		);
	} else {
		// Something happened in setting up the request and triggered an Error
		showAlert('error', 'Something unexpectedly happend! Please try again.');
	}
};
