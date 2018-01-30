var jwt = require('jsonwebtoken');

var seed = require('../config/config').SEED;

// =====================================================
// verificar token
//======================================================
exports.verificaToken = function(req, res, next) {
	var token = req.query.token;

	jwt.verify(token, seed, (err, decoded) => {
		if (err) {
			return res.status(401).json({
				ok: false,
				mensaje: 'Token incorrecto',
				errors: err
			});
		}

		req.usuario = decoded.usuario;

		next();
		//   return res.status(200).json({
		//       ok: true,
		//       decoded: decoded
		//   });
	});
};

// =====================================================
// verificar admin
//======================================================
exports.verificaAdminRole = function(req, res, next) {
	var usuario = req.usuario;

	if (usuario.role === 'ADMIN_ROLE') {
		next();
		return;
	} else {
		return res.status(401).json({
			ok: false,
			mensaje: 'Token incorrecto - no es admin',
			errors: {
				message:
					'no es administrador, no tiene permisos para esta accion.'
			}
		});
	}
};

// =====================================================
// verificar admin o mismo usuario
//======================================================
exports.verificaAdmin_o_MismoUsuario = function(req, res, next) {
	var usuario = req.usuario;
	var id = req.params.id;

	if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
		next();
		return;
	} else {
		return res.status(401).json({
			ok: false,
			mensaje: 'Token incorrecto - no es admin ni el mismo usuario',
			errors: {
				message:
					'no es administrador, no tiene permisos para esta accion.'
			}
		});
	}
};
