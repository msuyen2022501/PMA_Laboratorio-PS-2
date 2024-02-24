const express = require('express');
const cors = require('cors');
const { dbConnection } = require('../db/config');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 5000;
        this.usuariosPath = '/laboratorio-ps-2/usuarios';
        this.cursosPath = '/laboratorio-ps-2/cursos';
        this.estudiantesPath = '/laboratorio-ps-2/estudianteCursos'

        this.conectarDB();
        this.middlewares();
        this.routes();
    }

    async conectarDB() {
        await dbConnection();
    }

    middlewares() {
        this.app.use(express.static('public'));
        this.app.use(cors());
        this.app.use(express.json());
    }

    routes() {
        this.app.use(this.usuariosPath, require('../routes/user.routes'));
        this.app.use(this.cursosPath, require('../routes/cursos.routes'));
        this.app.use(this.estudiantesPath, require('../routes/usuarioCurso.routes'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor ejecutado y escuchando en el puerto', this.port);
        });
    }
}

module.exports = Server;