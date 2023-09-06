const express = require('express');

const depController = require('../controller/depController');
const authController = require('../controller/authController');

const router = express.Router();

// Get All Departures in all Districts
router.get(
	'/districtDepartures/:districtOfDep/date/:date',
	depController.getDistrictDepartures
);

// Get Summary of All departures
router.get(
	'/getDeparturesSummary/:districtOfDep',
	depController.getDeparturesSummary
);

router.patch('/:phoneOrEmail/confirmDeparture', depController.confirmDeparture);

router
	.route('/')
	.get(depController.getAllDepartures)
	.post(depController.createDeparture);

router
	.route('/:phoneOrEmail')
	.get(depController.getDeparture)
	.patch(depController.updateDeparture)
	.delete(depController.deleteDeparture);

module.exports = router;
