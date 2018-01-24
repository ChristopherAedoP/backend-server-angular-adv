var express = require('express');
var fileUpload = require('express-fileupload');

var app = express();
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var fs = require('fs');

// default options
app.use(fileUpload());

app.get('/', (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: 'peticion realizada correctamente.'
  });
});

app.put('/:tipo/:id', function(req, res) {
  var tipo = req.params.tipo;
  var id = req.params.id;

  //lista extenciones aceptadas
  var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'tipo no valida.',
      errors: {
        messaje: 'los tipos validas son :' + tiposValidos.join(',')
      }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Error no selecciono nada.',
      errors: { messaje: 'debe serleccionar una imagen' }
    });
  }

  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split('.');
  var extensionArchivo = nombreCortado[nombreCortado.length - 1];
  console.log(extensionArchivo);
  //lista extenciones aceptadas
  var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Extension no valida.',
      errors: {
        messaje: 'las entensiones validas son :' + extensionesValidas.join(',')
      }
    });
  }

  //nombre personalidado
  var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  //mover archivo a carpeta
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'error al mover archivo.',
        errors: err
      });
    }
  });

  subirPorTipo(tipo, id, nombreArchivo, res);
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
  if (tipo === 'usuarios') {
    Usuario.findById(id, (err, usuarioDB) => {
      if (!usuarioDB) {
        return res.status(400).json({
          ok: false,
          mensaje: 'el usuario con el id: ' + id + ' no existe',
          errors: { message: 'No existe un usuario con ese ID.' }
        });
      }

      var pathviejo = './uploads/usuarios/' + usuarioDB.img;
      if (fs.existsSync(pathviejo)) {
        fs.unlink(pathviejo);
      }

      usuarioDB.img = nombreArchivo;
      usuarioDB.save((err, usuarioActualizado) => {
        usuarioActualizado.password = ':)';
        return res.status(200).json({
          ok: true,
          mensaje: 'imagen de usuario actualizada',
          usuario: usuarioActualizado
        });
      });
    });
  }

  if (tipo === 'medicos') {
    Medico.findById(id, (err, medicoDB) => {
      if (!medicoDB) {
        return res.status(400).json({
          ok: false,
          mensaje: 'el medico con el id: ' + id + ' no existe',
          errors: { message: 'No existe un medico con ese ID.' }
        });
      }

      var pathviejo = './uploads/medicos/' + medicoDB.img;
      if (fs.existsSync(pathviejo)) {
        fs.unlink(pathviejo);
      }

      medicoDB.img = nombreArchivo;
      medicoDB.save((err, medicoActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'imagen de medico actualizada',
          medico: medicoActualizado
        });
      });
    });
  }

  if (tipo === 'hospitales') {
    Hospital.findById(id, (err, hospitalDB) => {
      if (!hospitalDB) {
        return res.status(400).json({
          ok: false,
          mensaje: 'el hospital con el id: ' + id + ' no existe',
          errors: { message: 'No existe un hospital con ese ID.' }
        });
      }

      var pathviejo = './uploads/hospitales/' + hospitalDB.img;
      if (fs.existsSync(pathviejo)) {
        fs.unlink(pathviejo);
      }

      hospitalDB.img = nombreArchivo;
      hospitalDB.save((err, hospitalActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'imagen de hospital actualizada',
          hospital: hospitalActualizado
        });
      });
    });
  }
}
module.exports = app;
