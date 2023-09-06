import axios from 'axios';

import { showAlert } from '../utils/alert';
import { loadingBtn } from '../utils/loadingBtn';
import { handleError } from '../utils/handleAjaxError';

const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('#logoutBtn');



// 1) Login
if (loginForm) {
	loginForm.addEventListener('submit', async e => {
		e.preventDefault();

		const formElements = loginForm.elements;
		const email = formElements['email'].value;
		const password = formElements['password'].value;
		const btn = formElements['btn-form-login'];

		loadingBtn(btn, 'disable');
		await login(email, password);
		loadingBtn(btn, 'enable');
	});
}

// 2) Logut
if (logoutBtn) {
	logoutBtn.addEventListener('click', () => logout());
}

const login = async (email, password) => {
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/users/login',
			data: {
				email,
				password,
			},
		});

		if (res.data.status === 'success') {
			showAlert('success', 'Logged in successfully');
			window.setTimeout(() => {
				location.assign('/profile');
			}, 1500);
		}
	} catch (err) {
		handleError(err);
	}
};

const logout = async (email, password) => {
	try {
		const res = await axios({
			method: 'GET',
			url: '/api/v1/users/logout',
		});

		if (res.data.status === 'success') {
			// True Means Prevent Page Reload FromCache
			location.assign('/');
		}
	} catch (err) {
		handleError(err);
	}
};
