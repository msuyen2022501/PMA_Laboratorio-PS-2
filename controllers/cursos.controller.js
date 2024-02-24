const { validationResult } = require('express-validator');
const Curso = require('../models/curso');
const Usuario = require('../models/usuario');
const usuarioCurso = require('../models/usuarioCurso');

const cursosGet = async (req, res) => {
    const { limite, desde } = req.query;
    const query = { estado: true };

    try {
        const [total, cursos] = await Promise.all([
            Curso.countDocuments(query),
            Curso.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        res.status(200).json({
            total,
            cursos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
};
const cursosPut = async (req, res) => {
    const { id } = req.params;
    const { nombre, maestroId } = req.body;

    try {
        if (!nombre && !maestroId) {
            return res.status(400).json({
                msg: 'Debes proporcionar al menos un campo para actualizar (nombre o maestroId)'
            });
        }

        const camposActualizados = {};
        if (nombre) camposActualizados.nombre = nombre;
        if (maestroId) {

            const Maestro = await Usuario.findById(maestroId);
            if (!Maestro) {
                return res.status(400).json({
                    msg: 'El maestro que ha sido asignado no existe'
                });
            }
            if (Maestro.role !== "TEACHER_ROLE") {
                return res.status(400).json({
                    msg: 'Un estudiante no puede ser asignado como maestro'
                });
            }
            camposActualizados.maestro = maestroId; 
        }

        const curso = await Curso.findByIdAndUpdate(id, camposActualizados, { new: true });

        if (!curso) {
            return res.status(404).json({
                msg: 'El Curso no ha sido encontrado'
            });
        }

        res.status(200).json({
            msg: 'Curso actualizado',
            curso
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
};


const cursosDelete = async (req, res) => {
    const { id } = req.params;
    const curso = await Curso.findByIdAndUpdate(id, { estado: false });

    await usuarioCurso.updateMany({ curso: id }, { estado: false });

    res.status(200).json({
        msg_1: 'Curso eliminado:',
        msg_2: curso.nombre
    });
};


const cursosPost = async (req, res) => {
    const { nombre, maestro } = req.body;

    const Maestro = await Usuario.findOne({ correo: maestro });
    if (!Maestro) {
        res.status(400).json({
            msg: 'El maestro asignado no existe'
        });
        return;
    }

    if (Maestro.role !== "TEACHER_ROLE") {
        return res.status(400).json({
            msg: 'Un estudiante no puede crear cursos'
        });
    }

    const cursoExistente = await Curso.findOne({ nombre, estado: false });

    if (cursoExistente) {
        cursoExistente.estado = true; 
        await cursoExistente.save();
        
        res.status(200).json({
            msg: 'Curso reactivado',
            curso: cursoExistente
        });
    } else {
        const cursoNuevo = new Curso({ nombre, maestro });
        await cursoNuevo.save();

        res.status(200).json({
            msg: 'Curso creado',
            curso: cursoNuevo
        });
    }
};

module.exports = {
    cursosDelete,
    cursosPost,
    cursosGet,
    cursosPut
};
