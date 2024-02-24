const { response, json } = require('express');
const usuarioCurso = require('../models/usuarioCurso');
const Usuario = require('../models/usuario');
const Curso1 = require('../models/curso');

const usuarioCursoGet = async (req, res = response) => {
    const { limite, desde } = req.query;
    const query = { estado: true }; 

    try {
        const [total, usuarioCursos] = await Promise.all([
            usuarioCurso.countDocuments(query),
            usuarioCurso.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
                .populate({
                    path: 'estudiante',
                    match: { estado: true },
                    select: 'nombre'
                })
                .populate({
                    path: 'curso',
                    match: { estado: true },
                    select: 'nombre'
                })
                .select('estudiante curso fecha_inscripcion')
        ]);

        const usuarioCursosFiltrados = usuarioCursos.filter(uc => uc.estudiante !== null);

        res.status(200).json({
            total,
            usuarioCursos: usuarioCursosFiltrados
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
};


const usuarioCursoPost = async (req, res) => {
    const { correo, materia } = req.body;

    try {
        const estudiante = await Usuario.findOne({ correo });
        if (!estudiante) {
            return res.status(400).json({ msg: 'El usuario no existe' });
        }

        let curso = await Curso1.findOne({ nombre: materia, estado: true });
        if (!curso) {
            return res.status(400).json({ msg: 'El curso que se quiere asignar no existe' });
        }

        if (!curso.estado) {
            curso.estado = true;
            await curso.save();
        }

        const cantidadCursosInscritos = await usuarioCurso.countDocuments({ estudiante: estudiante.id });

        if (cantidadCursosInscritos >= 3) {
            return res.status(400).json({
                msg: 'El estudiante ya está inscrito en el máximo número de cursos permitidos'
            });
        }

        const existeAsignacion = await usuarioCurso.findOne({ estudiante: estudiante.id, curso: curso.id });

        if (existeAsignacion) {
            return res.status(400).json({ msg: 'El estudiante ya está en este curso' });
        }

        const usuarioCursos = new usuarioCurso({
            estudiante: estudiante.id,
            curso: curso.id
        });

        await usuarioCursos.save();

        res.status(200).json({
            estudiante: estudiante.nombre,
            correo_estudiante: correo,
            curso: materia,
            fecha_inscripcion: usuarioCursos.fecha_inscripcion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
};


module.exports = {
    usuarioCursoPost,
    usuarioCursoGet
}
