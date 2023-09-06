import axios from 'axios';

import { showAlert } from '../utils/alert';
import { loadingBtn } from '../utils/loadingBtn';
import { closeModal } from '../components/modals';
import { handleError } from '../utils/handleAjaxError';
import { renderDashboard } from '../components/accountPage';
import { renderDepartures } from '../components/accountPage';

import { state } from '../index';
import { depSite } from '../components/accountPage';

const declareDepartureModal = document.querySelector('#declareDepartureModal');
const confirmModal = document.querySelector('#confirmModal');
const declareDepartureForm = document.querySelector('.form--declareDeparure');
const confirmForm = document.querySelector('.form--confirm');

// 1) Declare Departure
if (declareDepartureForm) {
	declareDepartureForm.addEventListener('submit', async e => {
		e.preventDefault();

		const formElements = declareDepartureForm.elements;

		const phoneOrEmail = formElements['phoneOrEmail'].value;
		const passenger = formElements['passenger'].value;
		const districtOfDep = formElements['districtOfDep'].value;
		const districtOfDest = formElements['districtOfDest'].value;
		const date = formElements['date'].value;
		const btn = formElements['declareBtn'];

		loadingBtn(btn, 'disable');

		await declareDeparture(
			phoneOrEmail,
			passenger,
			districtOfDep,
			districtOfDest,
			date
		);

		loadingBtn(btn, 'enable');
	});
}

// 2) Confirm Departure
if (confirmForm) {
	confirmForm.addEventListener('submit', async e => {
		e.preventDefault();
		const formElements = confirmForm.elements;
		const emailOrPhone = formElements['emailOrPhone'].value;
		const btn = formElements['btn-form-confirm'];

		loadingBtn(btn, 'disable');
		await confirmDeparture(emailOrPhone, confirmModal);
		loadingBtn(btn, 'enable');
	});
}

// 3) Search For Departures
document.addEventListener('click', e => {
	if (e.target.classList.contains('searchDeparturesForm__btn')) {
		e.target.parentElement.addEventListener('submit', async e => {
			e.preventDefault();

			const date = document.querySelector(
				'.searchDeparturesForm__input'
			).value;

			const btn = document.querySelector('.searchDeparturesForm__btn');

			loadingBtn(btn, 'disable');
			await getDepartures(depSite.departuresite, date);
			loadingBtn(btn, 'enable');
		});
	}
});

const declareDeparture = async (
	phoneOrEmail,
	passenger,
	districtOfDep,
	districtOfDest,
	date
) => {
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/departures',
			data: {
				phoneOrEmail,
				passenger,
				districtOfDep,
				districtOfDest,
				date,
			},
		});

		if (res.data.status === 'success') {
			showAlert('success', 'Departure declared successfully');
			closeModal(declareDepartureModal);
		}
	} catch (err) {
		handleError(err);
	}
};

const confirmDeparture = async emailOrPhone => {
	try {
		const res = await axios({
			method: 'PATCH',
			url: `/api/v1/departures/${emailOrPhone}/confirmDeparture`,
		});

		if (res.data.status === 'success') {
			showAlert('success', 'Departure confirmed');

			state.departures.pending--;
			state.departures.departed++;
			state.departures.allDepartures =
				state.departures.pending + state.departures.departed;

			renderDashboard();
			closeModal(confirmModal);
		}
	} catch (err) {
		handleError(err);
	}
};

export const getDeparturesSummary = async departuresite => {
	try {
		const url = `/api/v1/departures/getDeparturesSummary/${departuresite}`;
		const res = await axios(url);

		if (res.data.status === 'success') {
			state.departures = {};

			state.departures.pending = 0;
			state.departures.departed = 0;

			res.data.data.summary.forEach(el => {
				if (!el.departed) {
					state.departures.pending = el.num;
				}
				if (el.departed) {
					state.departures.departed = el.num;
				}
			});
			state.departures.allDepartures =
				state.departures.pending + state.departures.departed;

			renderDashboard();
		}
	} catch (err) {
		handleError(err);
	}
};

const getDepartures = async (departuresite, date) => {
	try {
		const res = await axios.get(
			`/api/v1/departures/districtDepartures/${departuresite}/date/${date}`
		);

		if (res.data.status === 'success') {
			state.departures.plannedDep = res.data.data;

			renderDepartures();
		}
	} catch (err) {
		handleError(err);
	}
};
