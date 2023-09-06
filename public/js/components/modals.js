const loginModal = document.querySelector('#loginModal');
const loginBtn = document.querySelector('#loginBtn');
const closeModalBtn = document.querySelectorAll('.close-modal');
const declareDepartureModal = document.querySelector('#declareDepartureModal');
const declareModalBtn = document.querySelectorAll('.declare-modal-btn');
const confirmModal = document.querySelector('#confirmModal');

const modalBtnEnventManger = (type, btn, modal) => {
	if (type === 'open') {
		btn.addEventListener('click', () => {
			showModal(modal);
		});
	}

	if (type === 'close') {
		Array.from(btn).forEach(btn => {
			btn.addEventListener('click', e => {
				closeModal(modal);
			});
		});
	}
};

const showModal = modal => {
	modal.classList.add('show');
};

export const closeModal = modal => {
	modal.classList.remove('show');
};

const modals = () => {
	// Delegation
	// 1) Display Login Modal
	if (loginBtn) {
		modalBtnEnventManger('open', loginBtn, loginModal);
		modalBtnEnventManger('close', closeModalBtn, loginModal);
	}

	// 2) Display Declare Departure Modal
	if (declareModalBtn.length > 0) {
		modalBtnEnventManger(
			'open',
			Array.from(declareModalBtn)[0],
			declareDepartureModal
		);
		modalBtnEnventManger(
			'open',
			Array.from(declareModalBtn)[1],
			declareDepartureModal
		);
		modalBtnEnventManger('close', closeModalBtn, declareDepartureModal);
	}

	// 3) Display Confirm Modal
	// DYNAMICALLY RENDERED ELEMENT
	document.addEventListener('click', e => {
		if (e.target.id === 'confirmBtn') {
			showModal(confirmModal);
		}
	});
	modalBtnEnventManger('close', closeModalBtn, confirmModal);
};

modals();
