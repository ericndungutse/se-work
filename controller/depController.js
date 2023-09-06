const Departure = require('../model/depModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { createOne, getAll, getOne } = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};

	Object.keys(obj).forEach(key => {
		if (allowedFields.includes(key)) {
			newObj[key] = obj[key];
		}
	});

	return newObj;
};

exports.createDeparture = createOne(Departure, 'departure');
exports.getAllDepartures = getAll(Departure, 'departures');
exports.getDeparture = getOne(Departure, 'departure');

exports.updateDeparture = catchAsync(async (req, res, next) => {
	let reqBody = { ...req.body };

	if (!req.user) {
		reqBody = filterObj(
			req.body,
			'phoneOrEmail',
			'passenger',
			'districtOfDep',
			'districtOfDest',
			'date'
		);
	}

	const departure = await Departure.findOneAndUpdate(
		{ phoneOrEmail: req.params.phoneOrEmail },
		reqBody,
		{
			new: true,
			runValidators: true,
		}
	);

	if (!departure) {
		return next(
			new AppError(`Departure you are trying to update does not exist.`, 404)
		);
	}

	res.status(200).json({
		status: 'success',
		data: {
			departure,
		},
	});
});

exports.deleteDeparture = catchAsync(async (req, res, next) => {
	const departure = await Departure.findOneAndDelete({
		phoneOrEmail: req.params.phoneOrEmail,
	});

	if (!departure) {
		return next(
			new AppError(`Departure you are trying to delete does not exist.`, 404)
		);
	}

	res.status(204).json({
		tatus: 'success',
		data: null,
	});
});

exports.confirmDeparture = catchAsync(async (req, res, next) => {
	const departure = await Departure.findOneAndUpdate(
		req.params,
		{ done: true },
		{
			new: true,
			runValidators: true,
		}
	);

	if (!departure) {
		return next(
			new AppError(
				`Departure you are trying to confirm does not exist.`,
				404
			)
		);
	}

	res.status(200).json({
		status: 'success',
		data: {
			departure,
		},
	});
});

exports.getDistrictDepartures = catchAsync(async (req, res, next) => {
	const departures = await Departure.aggregate([
		{
			$match: {
				districtOfDep: req.params.districtOfDep,
				date: new Date(`${req.params.date}`),
			},
		},

		{
			$group: {
				_id: '$districtOfDest',
				passengerNum: { $sum: 1 },
			},
		},

		{
			$addFields: {
				destination: '$_id',
			},
		},

		{
			$project: { _id: 0 },
		},
	]);

	res.status(200).json({
		status: 'success',
		data: {
			date: req.params.date,
			from: req.params.districtOfDep,
			departures,
		},
	});
});

exports.getDeparturesSummary = catchAsync(async (req, res, next) => {
	const summary = await Departure.aggregate([
		{
			$match: {
				districtOfDep: req.params.districtOfDep,
			},
		},

		{
			$group: {
				_id: '$done',
				num: { $sum: 1 },
			},
		},

		{
			$addFields: {
				departed: '$_id',
			},
		},

		{
			$project: { _id: 0 },
		},
	]);

	res.status(200).json({
		status: 'success',
		data: {
			summary,
		},
	});
});
