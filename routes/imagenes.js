var express = require('express');
var fs = require('fs');
var app = express();

app.get('/:tipo/:img', (req, res, next) => {
  var tipo = req.params.tipo;
  var img = req.params.img;

  // //lista extenciones aceptadas
  // var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

  // if (tiposValidos.indexOf(tipo) < 0) {
  //   return res.status(400).json({
  //     ok: false,
  //     mensaje: 'tipo no valida.',
  //     errors: {
  //       messaje: 'los tipos validas son :' + tiposValidos.join(',')
  //     }
  //   });
  // }

  var path = `./uploads/${tipo}/${img}`;

  fs.exists(path, existe => {
    if (!existe) {
      path = './assets/no-img.jpg';
    }

    res.sendfile(path);
  });
});

module.exports = app;
