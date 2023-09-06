const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model, modelName) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete({
			phoneOrEmail: req.body.phoneOrEmail,
		});

		if (!doc) {
			return next(
				new AppError(
					`${modelName} you are trying to delete does not exist`,
					404
				)
			);
		}
		res.status(204).json({
			status: 'success',
			data: null,
		});
	});

exports.updateOne = (Model, modelName) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.findOneAndUpdate(
			{ phoneOrEmail: req.body.phoneOrEmail },
			{
				phoneOrEmail: req.body.phoneOrEmail,
				passenger: req.body.passenger,
				districtOfDep: req.body.districtOfDep,
				districtOfDest: req.body.districtOfDest,
				date: req.body.date,
			},
			{
				new: true,
				runValidators: true,
			}
		);

		if (!doc) {
			return next(
				new AppError(
					`${modelName} you are trying to update does not exist.`,
					404
				)
			);
		}

		res.status(200).json({
			status: 'success',
			data: {
				[modelName]: doc,
			},
		});
	});

exports.createOne = (Model, modelName) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.create(req.body);

		res.status(201).json({
			status: 'success',
			data: {
				[modelName]: doc,
			},
		});
	});

exports.getAll = (Model, modelName) =>
	catchAsync(async (req, res, next) => {
		// To allow Nested Get Reviews on Tour (Hack)
		let filter = {};
		if (req.params.tourId) filter = { tour: req.params.tourId };
		// EXECUTE QUERY
		const features = new APIFeatures(Model.find(filter), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();

		const docs = await features.query;

		// SEND RESPONSE
		res.status(200).json({
			status: 'success',
			results: docs.length,
			data: {
				[modelName]: docs,
			},
		});
	});

exports.getOne = (Model, modelName) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.find({ phoneOrEmail: req.params.phoneOrEmail });

		if (!doc) {
			return next(new AppError(`${modelName} not found.'`, 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				[modelName]: doc,
			},
		});
	});

exports.getOneById = (Model, popOptions) =>
	catchAsync(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (popOptions) query.populate(popOptions);

		const doc = await query;

		if (!doc) {
			return next(new AppError('Document not found.', 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				data: doc,
			},
		});
	});
