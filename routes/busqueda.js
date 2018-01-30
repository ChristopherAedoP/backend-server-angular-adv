var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');
// =====================================================
// Obtener todos los hospitales
//======================================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
	var busqueda = req.params.busqueda;
	var tabla = req.params.tabla;

	var regex = new RegExp(busqueda, 'i');
	var respro;

	switch (tabla) {
		case 'hospitales':
			respro = buscarHospitales(busqueda, regex);
			break;
		case 'medicos':
			respro = buscarMedicos(busqueda, regex);
			break;
		case 'usuarios':
			respro = buscarUsuario(busqueda, regex);
			break;
		default:
			res.status(400).json({
				ok: false,
				mensaje: 'la tabla: ' + tabla + ' no existe.',
				errors: { message: 'la tabla no existe.' }
			});
	}

	respro.then(data => {
		res.status(200).json({
			ok: true,
			[tabla]: data
		});
	});
});

// =====================================================
// busqueda general
//======================================================
app.get('/todo/:busqueda', (req, res, next) => {
	var busqueda = req.params.busqueda;

	var regex = new RegExp(busqueda, 'i');

	Promise.all([
		buscarHospitales(busqueda, regex),
		buscarMedicos(busqueda, regex),
		buscarUsuario(busqueda, regex)
	]).then(respuesta => {
		res.status(200).json({
			ok: true,
			hospitales: respuesta[0],
			medicos: respuesta[1],
			usuarios: respuesta[2]
		});
	});
});

function buscarHospitales(busqueda, regex) {
	return new Promise((resolve, reject) => {
		Hospital.find({ nombre: regex })
			.populate('usuario', 'nombre email img')
			.exec((err, hospitales) => {
				if (err) {
					reject('Error al cargar los hospitales', err);
				} else {
					resolve(hospitales);
				}
			});
	});
}
function buscarMedicos(busqueda, regex) {
	return new Promise((resolve, reject) => {
		Medico.find({ nombre: regex })
			.populate('usuario', 'nombre email img')
			.populate('hospital')
			.exec((err, medicos) => {
				if (err) {
					reject('Error al cargar los medicos', err);
				} else {
					resolve(medicos);
				}
			});
	});
}
function buscarUsuario(busqueda, regex) {
	return new Promise((resolve, reject) => {
		Usuario.find({}, 'nombre email role img')
			.or([{ nombre: regex }, { email: regex }])
			.exec((err, usuarios) => {
				if (err) {
					reject('Error al cargar los usuario', err);
				} else {
					resolve(usuarios);
				}
			});
	});
}
module.exports = app;
