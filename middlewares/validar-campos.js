const { validationResult } = require('express-validator');
const Usuario = require('../models/usuario');

const validarCampos = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validarRolTeacher = async (req, res, next) => {
    const { maestroId } = req.body;

    if (!maestroId) {
        return res.status(400).json({
            msg: 'Debe proporcionar la ID del maestro'
        });
    }

    try {
        const existeUsuario = await Usuario.findById(maestroId);

        if (!existeUsuario) {
            return res.status(400).json({
                msg: 'El usuario con la ID proporcionada no existe'
            });
        }

        if (existeUsuario.role === "TEACHER_ROLE") {
            req.body.role = "TEACHER_ROLE";
            next();
        } else {
            return res.status(400).json({
                msg: 'Un estudiante no puede modificar cursos o eliminarlos.'
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            msg: 'Error interno del servidor'
        });
    }
};

module.exports = {
    validarRolTeacher,
    validarCampos
};
