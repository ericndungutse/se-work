const mongoose = require('mongoose');

const depSchema = new mongoose.Schema({
	phoneOrEmail: {
		type: String,
		required: [
			true,
			'Enter phone or email to uniquely identify ypur departure. ',
		],
		unique: true,
		lowercase: true,
	},

	passenger: String,

	districtOfDep: {
		type: String,
		lowercase: true,
		required: [true, 'Enter the district where your departure will begin.'],
	},

	districtOfDest: {
		type: String,
		lowercase: true,
		required: [true, 'Enter the district where your going.'],
	},

	done: {
		type: Boolean,
		default: false,
	},

	date: {
		type: Date,
		required: [true, 'Enter date on which you will depart.'],
	},
});

const Departure = mongoose.model('Departure', depSchema);

module.exports = Departure;
