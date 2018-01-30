var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var mdAutentificacion = require('../middlewares/autentificacion');

var Usuario = require('../models/usuario');

// =====================================================
// Obtener todos los usuarios
//======================================================
app.get('/', (req, res, next) => {
	var desde = req.query.desde || 0;
	desde = Number(desde);

	Usuario.find({}, 'nombre email img role google')
		.skip(desde)
		.limit(5)
		.exec((err, usuarios) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mensaje: 'Error cargando usuarios',
					errors: err
				});
			}

			Usuario.count({}, (err, conteo) => {
				res.status(200).json({
					ok: true,
					usuarios: usuarios,
					total: conteo
				});
			});
		});
});

// =====================================================
// crear un nuevo usuario
//======================================================
app.post('/', (req, res) => {
	var body = req.body;

	var usuario = new Usuario({
		nombre: body.nombre,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		img: body.img,
		role: body.role
	});

	usuario.save((err, usuarioGuardado) => {
		if (err) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Error guardado usuarios',
				errors: err
			});
		}

		res.status(201).json({
			ok: true,
			usuario: usuarioGuardado
			// usuarioToken: req.usuario
		});
	});
});

// =====================================================
// actualizar un nuevo usuario
//======================================================
app.put(
	'/:id',
	[
		mdAutentificacion.verificaToken,
		mdAutentificacion.verificaAdmin_o_MismoUsuario
	],
	(req, res) => {
		var id = req.params.id;
		var body = req.body;

		Usuario.findById(id, (err, usuarioDb) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mensaje: 'Error al buscar usuario',
					errors: err
				});
			}

			if (!usuarioDb) {
				return res.status(400).json({
					ok: false,
					mensaje: 'el usuario con el id: ' + id + ' no existe',
					errors: { message: 'No existe un usuario con ese ID.' }
				});
			}

			usuarioDb.nombre = body.nombre;
			usuarioDb.email = body.email;
			usuarioDb.role = body.role;

			usuarioDb.save((err, usuarioGuardado) => {
				if (err) {
					return res.status(400).json({
						ok: false,
						mensaje: 'Error al actualizar usuarios',
						errors: err
					});
				}

				usuarioGuardado.password = ':)';
				res.status(200).json({
					ok: true,
					usuario: usuarioGuardado
				});
			});
		});
	}
);

// =====================================================
// eliminar un nuevo usuario x id
//======================================================
app.delete(
	'/:id',
	[mdAutentificacion.verificaToken, mdAutentificacion.verificaAdminRole],
	(req, res) => {
		var id = req.params.id;
		var body = req.body;

		Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
			if (err) {
				return res.status(500).json({
					ok: false,
					mensaje: 'Error al buscar usuario',
					errors: err
				});
			}

			if (!usuarioBorrado) {
				return res.status(400).json({
					ok: false,
					mensaje: 'No existe un usuario con ese ID.',
					errors: { message: 'No existe un usuario con ese ID.' }
				});
			}

			res.status(200).json({
				ok: true,
				usuario: usuarioBorrado
			});
		});
	}
);

module.exports = app;
