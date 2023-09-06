import axios from 'axios';

import { loadingBtn } from '../utils/loadingBtn';
import { showAlert } from '../utils/alert';
import { handleError } from '../utils/handleAjaxError';
import { getDeparturesSummary } from '../controller/departure';
import { capitalizeStr } from '../utils/str';

import { state } from '../index';

// 1) Account Elements
const account__content = document.querySelector('.account__content');
const sideNavDashboard = document.querySelector('.side-nav__dashboard');
const sideNavDepartures = document.querySelector('.side-nav__departures');
const sideNavSettings = document.querySelector('.side-nav__settings');

document.addEventListener('DOMContentLoaded', function () {
	if (account__content) renderDashboard();
});

// Get user Site
const userName = document.querySelector('.userName');
export let depSite;

if (userName) {
	depSite = JSON.parse(JSON.stringify(userName.dataset));
}

// Delegation
if (sideNavSettings) {
	sideNavSettings.addEventListener('click', () => {
		addRemoveActiveClass(
			[sideNavDashboard, sideNavDepartures],
			sideNavSettings
		);

		renderSettings();
	});
}

if (sideNavDashboard) {
	sideNavDashboard &&
		sideNavDashboard.addEventListener('click', () => {
			addRemoveActiveClass(
				[sideNavDepartures, sideNavSettings],
				sideNavDashboard
			);

			renderDashboard();
		});
}

if (sideNavDepartures) {
	sideNavDashboard &&
		sideNavDepartures.addEventListener('click', () => {
			addRemoveActiveClass(
				[sideNavDashboard, sideNavSettings],
				sideNavDepartures
			);
			renderDepartures();
		});
}

const addRemoveActiveClass = (deactivate, activate) => {
	deactivate.forEach(element => {
		element.classList.remove('active');
	});
	activate.classList.add('active');
};

// Update User Data: Email, Name and Photo
document.addEventListener('click', async e => {
	if (e.target.classList.contains('form-user-data-btn')) {
		const formElements = e.target.parentElement.parentElement;

		const name = formElements['name'].value;
		const email = formElements['email'].value;
		const btn = formElements['formUserDataBtn'];

		loadingBtn(btn, 'disable');
		const user = await updateSettings('data', { name, email });

		if (!user) {
			renderSettings();
			loadingBtn(btn, 'enable');
		} else {
			state.user = user;
			loadingBtn(btn, 'enable');
			renderSettings();
		}
	}
});

// Update Password
document.addEventListener('click', async e => {
	if (e.target.classList.contains('form-user-password-btn')) {
		const formElements = e.target.parentElement.parentElement;

		const currentPassword = formElements['password-current'].value;
		const password = formElements['newPassword'].value;
		const passwordConfirm = formElements['password-confirm'].value;
		const btn = formElements['formUserPasswordBtn'];

		loadingBtn(btn, 'disable');
		await updateSettings('password', {
			currentPassword,
			password,
			passwordConfirm,
		});
		loadingBtn(btn, 'enable');
	}
});

// Type is data or Password
const updateSettings = async (type, data) => {
	try {
		const url =
			type === 'password'
				? '/api/v1/users/updateMyPassword'
				: '/api/v1/users/updateMe';
		const res = await axios({
			method: 'PATCH',
			url,
			data,
		});

		if (res.data.status) {
			showAlert('success', `${type.toUpperCase()} updated successfully.`);
			return res.data.data.user;
		}
	} catch (err) {
		handleError(err);
	}
};

// Load User from API
const loadUser = async () => {
	try {
		const res = await axios.get(`/api/v1/users/me`, {
			withCredentials: true,
		});
		state.user = res.data.data.user;

		if (res.data.status === 'success') renderSettings();
	} catch (err) {
		handleError(err);
	}
};

// Render Setting Page
const renderSettings = () => {
	if (state.user) {
		const user = state.user;
		account__content.innerHTML = '';

		const markup = `<div class="user-settings">
				<div class="user-view">
					<div class="user-view__content">
						<div class="user-view__form-container">
							<h2 class="tertiary-heading gradient m-b-2">Your account settings</h2>
							<form class="form form-user-data">
								<div class="form__group">
									<label class="form__label" for="name">Name</label
									><input
										type="text"
										class="form__input"
										id="name"
										value= "${user.name}"
										required="required"
									/>
								</div>
								<div class="form__group m-b-3 ma-bt-md">
									<label class="form__label" for="email"
										>Email address</label
									><input
										class="form__input"
										type="email"
										id="email"
										value=${user.email}
										required="required"
									/>
								</div>
								<div class="form__group form__photo-upload m-b-2">
									<img
										class="form__user-photo"
										src="/img/users/default.jpeg"
										alt=${user.name}
									/><input
										class="form__upload"
										type="file"
										name="photo"
										id="photo"
										accept="image/*"
									/><label for="photo">Choose new photo</label>
								</div>
								<div class="form__group right">
									<button class="btn btn--secondary btn--blue form-user-data-btn" id="formUserDataBtn">
										Save settings
									</button>
								</div>
							</form>
						</div>
						<div class="line">&nbsp;</div>
						<div class="user-view__form-container">
							<h2 class="tertiary-heading gradient m-b-2">Password change</h2>
							<form class="form form-user-password">
								<div class="form__group">
									<label class="form__label" for="password-current"
										>Current password</label
									><input
										class="form__input"
										id="password-current"
										type="password"
										placeholder="••••••••"
										required="required"
										minlength="8"
									/>
								</div>
								<div class="form__group">
									<label class="form__label" for="password"
										>New password</label
									><input
										class="form__input"
										id="newPassword"
										type="password"
										placeholder="••••••••"
										required="required"
										minlength="8"
									/>
								</div>
								<div class="form__group ma-bt-lg m-b-1">
									<label class="form__label" for="password-confirm"
										>Confirm password</label
									><input
										class="form__input"
										id="password-confirm"
										type="password"
										placeholder="••••••••"
										required="required"
										minlength="8"
									/>
								</div>
								<div class="form__group right">
									<button class="btn btn--secondary btn--blue form-user-password-btn" id="formUserPasswordBtn">
										Save password
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>`;

		account__content.insertAdjacentHTML('afterbegin', markup);
	} else {
		account__content.innerHTML = '';
		account__content.insertAdjacentHTML(
			'afterbegin',
			`<div class="user-settings">
					<div class="user-view">
				<div class="user-view__content">
					<div class="user-view__form-container">
						<h2 class="tertiary-heading gradient m-b-2">Your account settings</h2>
						<form class="form form-user-data">
							<div class="form__group">
								<label class="form__label" for="name">
									<div class="skeleton-2 skeleton-2__text"></div>
								</label
								>
							</div>
							<div class="form__group m-b-3 ma-bt-md">
								<label class="form__label" for="email"
									><div class="skeleton-2 skeleton-2__text"></div></label
								>
							</div>
							<div class="form__group form__photo-upload m-b-2">
								<img
									class="form__user-photo skeleton-2"
								/><label for="photo"><div class="skeleton-2 skeleton-2__text"></div></label>
								<input
									class="form__upload"
									type="file"
									name="photo"
									id="photo"
									accept="image/*"
								/><label for="photo">Choose new photo</label>
							</div>
							<div class="form__group right">
								<button class="btn btn--secondary btn--blue form-user-data-btn" id="formUserDataBtn">
									Save settings
								</button>
							</div>
						</form>
					</div>
					<div class="line">&nbsp;</div>
					<div class="user-view__form-container">
						<h2 class="tertiary-heading gradient m-b-2">Password change</h2>
						<form class="form form-user-password">
							<div class="form__group">
								<label class="form__label" for="password-current"
									>Current password</label
								><input
									class="form__input"
									id="password-current"
									type="password"
									placeholder="••••••••"
									required="required"
									minlength="8"
								/>
							</div>
							<div class="form__group">
								<label class="form__label" for="password"
									>New password</label
								><input
									class="form__input"
									id="newPassword"
									type="password"
									placeholder="••••••••"
									required="required"
									minlength="8"
								/>
							</div>
							<div class="form__group ma-bt-lg m-b-1">
								<label class="form__label" for="password-confirm"
									>Confirm password</label
								><input
									class="form__input"
									id="password-confirm"
									type="password"
									placeholder="••••••••"
									required="required"
									minlength="8"
								/>
							</div>
							<div class="form__group right">
								<button class="btn btn--secondary btn--blue form-user-password-btn" id="formUserPasswordBtn">
									Save password
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
				</div>`
		);

		loadUser();
	}
};

// Render Dashboard
export const renderDashboard = () => {
	if (state.departures) {
		const confirmedDeparturesPer =
			(state.departures.departed / state.departures.allDepartures) * 100;

		const pendingDeparuresPer =
			(state.departures.pending / state.departures.allDepartures) * 100;

		account__content.innerHTML = '';
		const markup = `<div class="account__header">
						<h1 class="tertiary-heading gradient"><b>Site: ${
							depSite.departuresite
						} </b></h1>
						<button class="btn btn--secondary btn--blue confirmBtn" id="confirmBtn">&plus; Confirm Departure</button>
					</div>

					<div class="account__body">
						<div class="dashboard">
						
						<div class="dashboard__header">
							<form class="form-dashboard">
							<div class="form-dashboard__group" style="display: inline-block;">
								<label class="form-dashboard__label" for="departureDate">Select date to track</label>
							</div>
							<div class="form-dashboard__form-group">
								<input class="form-dashboard__input" id="departureDate" type="text" list="departureDates" placeholder="Date..."/>
								<datalist id="departureDates">
								<option alue="23/09/2021"></option>
								<option value="23/07/2021"></option>
								<option value="23/04/2021"></option>
								</datalist>
							</div>
							</form>
						</div>
						<div class="dashboard__body">
							<div class="cards">
							<div class="card--dashboard">
								<div class="card--dashboard__header">All Departures</div>
								<div class="card--dashboard__body">${state.departures.allDepartures}</div>
							</div>
							<div class="card--dashboard">
								<div class="card--dashboard__header">Confirmed</div>
								<div class="card--dashboard__body">${state.departures.departed}</div>
								<div class="card--dashboard__footer">${confirmedDeparturesPer.toFixed(2)}%</div>
							</div>
							<div class="card--dashboard">
								<div class="card--dashboard__header">Pending</div>
								<div class="card--dashboard__body">${state.departures.pending}</div>
								<div class="card--dashboard__footer">${pendingDeparuresPer.toFixed(2)}%</div>
							</div>
							</div>
						
					</div>
					</div>
				`;

		account__content.insertAdjacentHTML('afterbegin', markup);
	} else {
		account__content.innerHTML = '';
		account__content.insertAdjacentHTML(
			'afterbegin',
			`
					<div class="account__header">
						<h1 class="tertiary-heading gradient"><b>Site: Muhanga </b></h1>
						<button class="btn btn--secondary btn--blue confirmBtn" id="confirmBtn">&plus; Confirm Departure</button>
						</div>
						<div class="dashboard">
						
						<div class="dashboard__header">
							<form class="form-dashboard">
							<div class="form-dashboard__group" style="display: inline-block;">
								<label class="form-dashboard__label" for="departureDate">Select date to track</label>
							</div>
							<div class="form-dashboard__form-group">
								<input class="form-dashboard__input" id="departureDate" type="text" list="departureDates" placeholder="Date..."/>
								<datalist id="departureDates">
								<option alue="23/09/2021"></option>
								<option value="23/07/2021"></option>
								<option value="23/04/2021"></option>
								</datalist>
							</div>
							</form>
						</div>
						<div class="dashboard__body">
							<div class="cards">
								<span class="skeleton-1"></span>
								<span class="skeleton-1"></span>
								<span class="skeleton-1"></span>
							</div>
						
					</div>
				</div>
				`
		);
		getDeparturesSummary(depSite.departuresite);
	}
};

// Render Departures
export const renderDepartures = async () => {
	let markup;
	// No planed Departures availble: Inform User to search
	if (!state.departures.plannedDep) {
		account__content.innerHTML = '';
		markup = createTable('no_deps_prop');

		account__content.insertAdjacentHTML('afterbegin', markup);
	}

	if (state.departures.plannedDep && state.departures.plannedDep.length != 0) {
		// Render Departures into the DOM using a teble
		account__content.innerHTML = '';
		markup = createTable('deps');
		account__content.insertAdjacentHTML('afterbegin', markup);
	}

	if (state.departures.plannedDep && state.departures.plannedDep.length == 0) {
		// No departures avaible for the provided date.
		account__content.innerHTML = '';
		markup = createTable('no_deps');
		account__content.insertAdjacentHTML('afterbegin', markup);
	}
};

const createTable = controller => {
	let markup;
	if (controller === 'no_deps_prop') {
		markup = `<div class="account__header">
							<h1 class="tertiary-heading gradient"><b>Site: ${depSite.departuresite} </b></h1>
							<form class="searchDeparturesForm">
								<input type="date" class="searchDeparturesForm__input"/>
								<button type="submit" class="btn btn--secondary btn--blue searchDeparturesForm__btn">Search</button>
							</form>
						</div>
							<div class="account__body">
								<div class="search_img_container">
									<h1 class="search_img_container-heading">Search For Departures</h1>
									<img src="/img/png/searchImg.png" class="search_img"/>
								</div>
							</div>
						</div>
				</div>`;
	}

	if (controller === 'no_deps') {
		markup = markup = `<div class="account__header">
							<h1 class="tertiary-heading gradient"><b>Site: ${depSite.departuresite} </b></h1>
							<form class="searchDeparturesForm">
								<input type="date" class="searchDeparturesForm__input"/>
								<button type="submit" class="btn btn--secondary btn--blue searchDeparturesForm__btn">Search</button>
							</form>
						</div>
							<div class="account__body">
								<div class="search_img_container">
									<h1 class="search_img_container-heading">No Departures specified for provide date</h1>
									<img src="/img/png/searchImg.png" class="search_img"/>
								</div>
							</div>
						</div>
				</div>`;
	}

	if (controller === 'deps') {
		const tableRaws = state.departures.plannedDep.departures
			.map(
				(dep, index) =>
					`
						<li class="table-row">
      						<div class="col col-1">${index + 1}</div>
      						<div class="col col-2">${capitalizeStr(dep.destination)}</div>
      						<div class="col col-3">${dep.passengerNum}</div>
      					</li>
					`
			)
			.join('');

		markup = `<div class="account__header">
					<h1 class="tertiary-heading gradient"><b>Site: ${capitalizeStr(
						depSite.departuresite
					)} </b></h1>
					<form class="searchDeparturesForm">
						<input type="date" class="searchDeparturesForm__input"/>
						<button type="submit" class="btn btn--secondary btn--blue searchDeparturesForm__btn">Search</button>
					</form>
				</div>
				<div class="account__body">
					<div class="planedDepartures">
						<div class="planedDepartures__header">
							<h3 class="tertiary-heading color-black f-size-6">Planned Departures On ${
								state.departures.plannedDep.date
							}</h3>
							<button class="btn btn--secondary btn--blue btnPrint">Print</button>
						</div>
						<div class="table_container">
							<ul class="responsive-table">
							<li class="table-header">
							<div class="col col-1">#</div>
							<div class="col col-2">Destination</div>
							<div class="col col-3">Number</div>
							</li>
							
							${tableRaws}
							
							</ul>
						</div>
					</div>
				</div>`;
	}
	return markup;
};
