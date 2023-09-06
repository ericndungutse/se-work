const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};

	Object.keys(obj).forEach(key => {
		if (allowedFields.includes(key)) {
			newObj[key] = obj[key];
		}
	});

	return newObj;
};

exports.getMe = (req, res, next) => {
	req.params.id = req.user._id;
	next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
	// 1) Create Error if User Post Password Data
	if (req.body.password || req.body.passwordConfirm)
		return next(
			new AppError(
				'This route is not for updating password! Please use /updateMyPassword',
				400
			)
		);

	// 2) Filter out fields that are not allowed to change
	const filteredBody = filterObj(req.body, 'name', 'email');
	if (req.file) filteredBody.photo = req.file.filename;

	// 3) Update User Document
	const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		status: 'success',
		data: {
			user,
		},
	});
});

exports.deleteMe = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user._id, { active: false });

	res.status(204).json({
		status: 'success',
		data: null,
	});
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	res.status(200).json({
		status: 'success',
		data: {
			user,
		},
	});
});
// Do not delete passwords with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
