// Requires

var express = require('express');
var mongoose = require('mongoose');

// Inicializar variales
var app = express();

//conexion a base a datos
mongoose.connection.openUri(
  'mongodb://localhost:27017/hospitalDB',
  (err, res) => {
    if (err) throw err;

    console.log(
      'base de datos:  \x1b[32m%s\x1b[0m',
      'Online'
    );
  }
);

//Rutas
app.get('/', (req, res, next) => {
  res.status(200).json({
    ok: true,
    mensaje: 'peticion realizada correctamente.'
  });
});

// Escuchar peticiones.
app.listen(3000, () => {
  console.log(
    'Express server corriendo en el puerto 3000:  \x1b[32m%s\x1b[0m',
    'Online'
  );
});
