// Requires

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variales
var app = express();

// CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
    next();
});


// body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importaciones rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

//conexion a base a datos
const config = require('./config')
    // mongoose.connection.openUri(
    //     process.env.MONGODB_URI || 'mongodb://localhost:27017/hospitalDB',
    //     (err, res) => {
    //         if (err) throw err;

//         console.log('base de datos:  \x1b[32m%s\x1b[0m', 'Online');
//     }
// );

mongoose.connect(config.db, (err, res) => {
    if (err) {
        return console.log(`Error al conectar a la base de datos: ${err}`)
    }
    console.log('Conexión a la base de datos establecida, OK!')

    // app.listen(config.port, () => {
    //     console.log(`API REST corriendo en http://localhost:${config.port}`)
    // })
})

// Server index config
// ** carpetas publicas
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));

////Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

// Escuchar peticiones.
var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
app.listen(server_port, () => {
    console.log(
        'Express server corriendo en el puerto:' + server_port,
        'Online!'
    );
});