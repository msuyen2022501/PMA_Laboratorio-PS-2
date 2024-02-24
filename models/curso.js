const { Schema, model} = require('mongoose');

const CursoSchema = Schema ({
    nombre: {
        type: String,
        required: [true, 'Nombre obligatorio']
    },
    estado:{
        type: Boolean,
        default: true
    },
    maestro:{
        type: String,
        required: [true, 'Maestro obligatorio']
    }
});

module.exports = model('Curso', CursoSchema);