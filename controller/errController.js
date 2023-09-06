const AppError = require('./../utils/appError');

const sendErrorDev = (err, req, res) => {
	// API
	if (req.originalUrl.startsWith('/api')) {
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack,
		});
		// UI
	} else {
		return res.status(err.statusCode).render('error', {
			title: 'Something went wrong!',
			msg: err.message,
		});
	}
};

const sendErrorProd = (err, req, res) => {
	// API
	if (req.originalUrl.startsWith('/api')) {
		// EXPECTED ERROR
		if (err.isOperational) {
			res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
			// UNEXPECTED ERROR
		} else {
			// 1) LOG ERROR
			console.error('ERROR: ', err);
			// 2) SEND GENERIC MESSAGE
			res.status(500).json({
				status: 'error',
				message: 'Something went wrong!',
			});
		}
		// UI
	} else {
		if (err.isOperational) {
			res.status(err.statusCode).render('error', {
				title: 'Error',
				msg: err.message,
			});
			// UNEXPECTED ERROR
		} else {
			// 1) LOG ERROR
			console.error('ERROR: ', err);
			// 2) SEND GENERIC MESSAGE

			res.status(500).render('error', {
				title: 'Error',
				msg: 'Something went wrong! Please try again later.',
			});
		}
	}
};

const handleCastErrorDB = err => {
	const message = `Invalid ${err.path}: "${err.value}".`;
	return new AppError(message, 400);
};

const handleDuplicatesDB = err => {
	const message = `The ${Object.keys(err.keyPattern)[0]}: ${
		Object.values(err.keyValue)[0]
	} already exist, please provide a different ${
		Object.keys(err.keyPattern)[0]
	}`;

	return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
	const errors = Object.values(err.errors)
		.map(error => error.properties.message)
		.join(', ');

	const message = `Invalid inputs: ${errors}`;
	return new AppError(message, 400);
};

const handleJWTError = () =>
	new AppError('Invalid token please login again', 401);

const handleJWTExpiredError = () =>
	new AppError('Your token has epired! Please login again.', 401);

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV.trim() == 'development') {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV.trim() === 'production') {
		let error = { ...err };
		error.message = err.message;

		if (err.name === 'CastError') error = handleCastErrorDB(error);
		if (err.code === 11000) error = handleDuplicatesDB(error);
		if (err.name === 'ValidationError')
			error = handleValidationErrorDB(error);
		if (err.name === 'JsonWebTokenError') error = handleJWTError(error);
		if (err.name === 'TokenExpiredError')
			error = handleJWTExpiredError(error);

		sendErrorProd(error, req, res);
	}
};
