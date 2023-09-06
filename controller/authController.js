const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
// const Email = require('./../utils/email');
const AppError = require('./../utils/appError');

const signToken = id => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createAndSendToken = (user, statusCode, req, res) => {
	const token = signToken(user._id);

	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),

		httpOnly: true,
		secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
	};

	// JWt name of the cookie, Token: Value, Options
	res.cookie('jwt', token, cookieOptions);

	user.password = undefined;
	res.status(statusCode).json({
		status: 'success',
		token,
		data: {
			user,
		},
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const newUser = await User.create(req.body);

	// const url = `${req.protocol}://${req.get('host')}/me`;
	// await new Email(newUser, url).sendWelcome();

	createAndSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// 1) CHECK IF EMAIL AND PASSWORD ARE PRESENT
	if (!email || !password) {
		return next(new AppError('Please provide email and password'), 400);
	}

	// 2) CHECK IF USER EXISTS AND PASSWORD IS CORRECT
	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password)))
		return next(new AppError('Email or password is incorrect', 401));

	// 3) IF EVERYTHING OK, SIGN AND SEND TOKEN TO CLIENT
	createAndSendToken(user, 200, req, res);
});

exports.logout = (req, res, next) => {
	res.cookie('jwt', 'loggedout', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});

	res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
	let token;

	// 1) GET THE TOKEN AND CHECK IF IT EXIST
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	if (!token)
		return next(
			new AppError(
				'Your are not logged in! Please login to get access.',
				401
			)
		);

	// 2) VELIFY THE TOKEN (VERIFY AND CHECK TIMESPAN)
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// 3) CHECK IF USER STILL EXIST
	const currentUser = await User.findById({ _id: decoded.id });
	if (!currentUser) return next(new AppError('User no longer exists', 401));

	// 4) CHECK USER RECENTLY CHANGED PASSWORD AFTER TOKEN WAS ISSUED
	if (currentUser.changedPasswordAfter(decoded.iat))
		return next(
			new AppError(
				'User recently changed password! Please login again.',
				401
			)
		);

	// 5) GRANT ACCESS (AUTHORIZE)
	req.user = currentUser;
	res.locals.user = currentUser;
	next();
});

// For Rendering
exports.isLoggedIn = async (req, res, next) => {
	if (req.cookies.jwt) {
		try {
			// 1) VELIFY THE TOKEN (VERIFY AND CHECK TIMESPAN)
			const decoded = await promisify(jwt.verify)(
				req.cookies.jwt,
				process.env.JWT_SECRET
			);

			// 2) CHECK IF USER STILL EXIST
			const currentUser = await User.findById({ _id: decoded.id });
			if (!currentUser) return next();

			// 3) CHECK USER RECENTLY CHANGED PASSWORD AFTER TOKEN WAS ISSUED
			if (currentUser.changedPasswordAfter(decoded.iat)) return next();

			// 5) There is a user. Availing user to all pug templates
			res.locals.user = currentUser;
			return next();
		} catch (error) {
			return next();
		}
	}
	next();
};

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError(
					'Access denied! You are not allowed to perform this operation.',
					403
				)
			);
		}

		next();
	};
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1) GET USER BASED ON POSTED EMAIL
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(
			new AppError('There is no user with that email address', 404)
		);
	}

	// 2) GENERATE A RANDOM RESET TOKEN
	const resetToken = user.createpasswordResetToken();
	await user.save({ validateBeforeSave: false });

	// 3) SEND IT TO THE USER'S EMAIL
	const resetURL = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/users/resetPassword/${resetToken}`;

	res.status(200).json({
		status: 'success',
		message: 'Link to reset password was sent to your email.',
		resetToken,
	});
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1) GET USER BASED ON TOKEN
	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	});

	// 2) IF THE TOKEN HAS NOT EXPIRED AND USER EXISTS SET THE NEW PASSWORD
	if (!user) {
		return next(new AppError('Token is invalid or has expired', 400));
	}

	// 3) UPDATE CHABGEDPASSWORDAT PROPERTY FOR THE USER
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	// 4) lOG THE USER IN, SEND JWT

	createAndSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	//  1) Get userfrom collection
	const user = await User.findById(req.user._id).select('+password');
	if (!user) return next(new AppError(`User doesn't exist.`, 404));

	// 2) Check if posted current password is
	if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
		return next(new AppError('Your current password is wrong', 401));
	}

	if (req.body.password !== req.body.passwordConfirm) {
		return next(
			new AppError('New password and confirm password are not the same', 401)
		);
	}

	// 3) If correct, update the password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();

	// 4) Log the user in, send the JWT
	createAndSendToken(user, 200, req, res);
});
