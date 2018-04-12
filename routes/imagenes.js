var express = require('express');

var app = express();


const path = require('path');
var fs = require('fs');
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

  var pathImagen = path.resolve(__dirname, `../uploads/${ tipo }/${ img }` );

  if (fs.existsSync(pathImagen)) {

    res.sendFile(pathImagen);
  }else{
    var pathNoImage = path.resolve(__dirname,`../assets/no-img.jpg`);
    res.sendFile(pathNoImage);
  };
});

module.exports = app;
