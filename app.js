const path = require('path');
const helmet = require('helmet');
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');

const depRouter = require('./routes/dep.routes');
const viewRouter = require('./routes/view.routes');
const userRouter = require('./routes/user.routes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errController');

// INITIALIZE EXPRESS APP
const app = express();

app.enable('trust proxy');

// Implement Cors
app.use(cors());
app.options('*', cors());

// Set Security HTTP Headers
app.use(helmet());

// Logger;
app.use(morgan('dev'));

// Template engine set up
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Add data to the req body property
app.use(
	express.json({
		limit: '10kb',
	})
);

// Data Sanitization Against NoSQL query Injection
app.use(mongoSanitize());

// Data Sanitizatiion Against XSS
app.use(xss());

// Prevent Parameter Polution
app.use(hpp());

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// COOKIE PARSER
app.use(cookieParser());

// Compress Response
app.use(compression());

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/departures', depRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
