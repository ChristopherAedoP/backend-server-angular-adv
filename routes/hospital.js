var express = require('express');

var app = express();

var mdAutentificacion = require('../middlewares/autentificacion');

var Hospital = require('../models/hospital');

// =====================================================
// Obtener todos los hospitales
//======================================================
app.get('/', (req, res, next) => {
	var desde = req.query.desde || 0;
	desde = Number(desde);

	Hospital.find({})
		.skip(desde)
		.limit(5)
		.populate('usuario', 'nombre email')
		.exec((err, hospital) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mensaje: 'Error cargando hospitales',
					errors: err
				});
			}

			Hospital.count({}, (err, conteo) => {
				res.status(200).json({
					ok: true,
					hospitales: hospital,
					total: conteo
				});
			});
		});
});

// =====================================================
// crear un nuevo hospital
//======================================================
app.post('/', mdAutentificacion.verificaToken, (req, res) => {
	var body = req.body;

	var hospital = new Hospital({
		nombre: body.nombre,
		usuario: req.usuario._id
	});

	hospital.save((err, hospitalGuardado) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error guardado hospital',
				errors: err
			});
		}

		res.status(201).json({
			ok: true,
			hospital: hospitalGuardado
		});
	});
});

// =====================================================
// actualizar hospital
//======================================================
app.put('/:id', mdAutentificacion.verificaToken, (req, res) => {
	var id = req.params.id;
	var body = req.body;

	Hospital.findById(id, (err, hospitalDb) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar hospital',
				errors: err
			});
		}

		if (!hospitalDb) {
			return res.status(400).json({
				ok: false,
				mensaje: 'el hospital con el id: ' + id + ' no existe',
				errors: { message: 'No existe un hospital con ese ID.' }
			});
		}

		hospitalDb.nombre = body.nombre;
		hospitalDb.usuario = req.usuario._id;

		hospitalDb.save((err, hospitalGuardado) => {
			if (err) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Error al actualizar hospital',
					errors: err
				});
			}

			res.status(200).json({
				ok: true,
				hospital: hospitalGuardado
			});
		});
	});
});

// =====================================================
// eliminar un nuevo hospital x id
//======================================================
app.delete('/:id', mdAutentificacion.verificaToken, (req, res) => {
	var id = req.params.id;

	Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar hospital',
				errors: err
			});
		}

		if (!hospitalBorrado) {
			return res.status(400).json({
				ok: false,
				mensaje: 'No existe un hospital con ese ID.',
				errors: { message: 'No existe un hospital con ese ID.' }
			});
		}

		res.status(200).json({
			ok: true,
			hospital: hospitalBorrado
		});
	});
});

//==========================================
//Obtener Hospital por ID
//==========================================

app.get('/:id', (req, res) => {
	var id = req.params.id;

	Hospital.findById(id)
		.populate('usuario', 'nombre img email')
		.exec((err, hospital) => {
			if (err) {
				returnres.status(500).json({
					ok: false,
					mensaje: 'Error al buscar hospital',
					errors: err
				});
			}

			if (!hospital) {
				returnres.status(400).json({
					ok: false,
					mensaje: 'El hospital con el id' + id + 'no existe',
					errors: { message: 'No existe un hospital con ese ID' }
				});
			}

			res.status(200).json({ ok: true, hospital: hospital });
		});
});

module.exports = app;
