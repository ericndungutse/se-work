'use strict';

import '@babel/polyfill';
import './components/modals';
import './components/accountPage';
import './controller/authentication';
import './controller/departure';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { capitalizeStr } from './utils/str';

export const state = {};

const createPdf = () => {
	const dd = {
		content: [
			{
				text: 'SafeJ\n\n',
				style: 'logo',
			},

			{
				text: `Planned Departures from ${capitalizeStr(
					state.departures.plannedDep.from
				)}, on ${state.departures.plannedDep.date}\n\n`,
				style: 'title',
			},

			{
				table: {
					headerRows: 1,
					widths: [50, '*', '*'],

					body: [
						[
							{
								text: '#',
								bold: true,
								fontSize: 16,
							},
							{
								text: 'Destinations',
								bold: true,
								fontSize: 16,
							},
							{
								text: 'Number',
								bold: true,
								fontSize: 16,
							},
						],

						[
							state.departures.plannedDep.departures.map(
								(_, index) => index + 1
							),
							state.departures.plannedDep.departures.map((dep, index) =>
								capitalizeStr(dep.destination)
							),
							state.departures.plannedDep.departures.map(
								(dep, index) => dep.passengerNum
							),
						],
					],
				},
			},
		],

		styles: {
			logo: {
				fontSize: 28,
				bold: true,
				color: 'blue',
				margin: [0, 100, 0, 0],
			},

			title: {
				fontSize: 16,
				bold: true,
			},
		},
	};

	return dd;
};

document.addEventListener('click', function (e) {
	if (e.target.classList.contains('btnPrint')) {
		const dd = createPdf();
		pdfMake
			.createPdf(dd)
			.download(
				`${state.departures.plannedDep.from}-${state.departures.plannedDep.date}.pdf`
			);
	}
});
