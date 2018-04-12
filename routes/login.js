var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var seed = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

var mdAutenticacion = require('../middlewares/autentificacion');
// =====================================================
// renovar token
//======================================================
app.get('/renuevatoken', mdAutenticacion.verificaToken, (req, res) => {
	var token = jwt.sign(
		{
			usuario: req.usuario
		},
		seed,
		{
			expiresIn: 14400
		}
	);

	return res.status(200).json({
		ok: true,
		token: token
	});
});

// =====================================================
// Autentificacion Normal
//======================================================
app.post('/', (req, res) => {
	var body = req.body;

	Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error obtener usuario',
				errors: err
			});
		}

		if (!usuarioDB) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Credenciales incorrectas - email',
				errors: { message: 'Credenciales incorrectas - email' }
			});
		}

		if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
			return res.status(400).json({
				ok: false,
				mensaje: 'Credenciales incorrectas - password',
				errors: { message: 'Credenciales incorrectas - password' }
			});
		}
		//Crear token.
		usuarioDB.password = ':)';
		var token = jwt.sign({ usuario: usuarioDB }, seed, {
			expiresIn: 14400
		});

		res.status(200).json({
			ok: true,
			usuario: usuarioDB,
			token: token,
			id: usuarioDB._id,
			menu: obtenerMenu(usuarioDB.role)
		});
	});
});

// =====================================================
// Autentificacion Google
//======================================================

const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);
async function verify(token) {
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
		// Or, if multiple clients access the backend:
		//[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
	});
	const payload = ticket.getPayload();
	// const userid = payload['sub'];
	// If request specified a G Suite domain:
	//const domain = payload['hd'];
	return {
		nombre: payload.name,
		email: payload.email,
		img: payload.img,
		google: true
	}
}


app.post('/google', async(req, res) => {
	var token = req.body.token || 'nada';

	var googleUser = await verify(token)
							.catch(e =>{
								return res.status(403).json({
									ok: false,
									mensaje: 'Token no valido',
								});
							});

	Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
		if (err) {
			return res.status(500).json({
				ok: false,
				mensaje: 'Error al buscar usuario - login',
				errors: err
			});
		}
		if (usuarioDB) {
			if (usuarioDB.google===false) {
				return res.status(400).json({
					ok: false,
					mensaje: 'Debe de usar su autenticacion normal'
				});
			} else {
				//Crear token.
				usuarioDB.password = ':)';
				var token = jwt.sign({ usuario: usuarioDB }, seed, {
					expiresIn: 14400
				});

				res.status(200).json({
					ok: true,
					usuario: usuarioDB,
					token: token,
					id: usuarioDB._id,
					menu: obtenerMenu(usuarioDB.role)
				});
			}
			// si el usuario no existe por correo
		} else {
			var usuarioNuevo = new Usuario();
			usuarioNuevo.nombre = payload.name;
			usuarioNuevo.email = payload.email;
			usuarioNuevo.password = ':)';
			usuarioNuevo.img = payload.picture;
			usuarioNuevo.google = true;

			usuarioNuevo.save((err, usuarioDB) => {
				if (err) {
					return res.status(500).json({
						ok: false,
						mensaje: 'Error al grabar usuario - google',
						errors: err
					});
				}

				//Crear token.
				usuarioDB.password = ':)';
				var token = jwt.sign({ usuario: usuarioDB }, seed, {
					expiresIn: 14400
				});

				res.status(200).json({
					ok: true,
					usuario: usuarioDB,
					token: token,
					id: usuarioDB._id,
					menu: obtenerMenu(usuarioDB.role)
				});
			});
		}		
	});

});

function obtenerMenu(Role) {
	menu = [
		{
			titulo: 'Principal',
			icono: 'mdi mdi-gauge',
			submenu: [
				{ titulo: 'Dashboard', url: '/dashboard' },
				{ titulo: 'ProgressBar', url: '/progress' },
				{ titulo: 'Graficas', url: '/graficas1' },
				{ titulo: 'Promesas', url: '/promesas' },
				{ titulo: 'rxjs', url: '/rxjs' }
			]
		},
		{
			titulo: 'Mantenedores',
			icono: 'mdi mdi-folder-lock-open',
			submenu: [
				// { titulo: 'Usuarios', url: '/usuarios' },
				{ titulo: 'Hospitales', url: '/hospitales' },
				{ titulo: 'Medicos', url: '/medicos' }
			]
		}
	];

	if (Role === 'ADMIN_ROLE') {
		menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
	}

	return menu;
}

module.exports = app;
