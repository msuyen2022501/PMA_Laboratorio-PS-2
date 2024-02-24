const { response, json } = require('express');
const bcryptjs = require('bcryptjs');
const Usuario = require('../models/usuario');
const { generarJWT } = require("../helpers/generar-jwt");
const usuarioCurso = require("../models/usuarioCurso")

const usuariosGet = async (req, res = response) => {
    const { limite, desde } = req.query;
    const query = { estado: true };

    const [total, usuarios] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
            .skip(Number(desde))
            .limit(Number(limite))
    ]);

    res.status(200).json({
        total,
        usuarios
    });
}

const usuariosPut = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    try {
        if (!nombre) {
            return res.status(400).json({
                msg: 'El campo "nombre" es requerido para la actualización'
            });
        }

        const usuario = await Usuario.findByIdAndUpdate(id, { nombre }, { new: true });

        if (!usuario) {
            return res.status(404).json({
                msg: 'El Usuario no ha sido encontrado'
            });
        }

        res.status(200).json({
            msg: 'Usuario actualizado',
            usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
}


const usuariosDelete = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await Usuario.findByIdAndUpdate(id, {estado: false}); 
        res.status(200).json({
            msg: 'El Usuario ha sido eliminado'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
}


const usuariosPost = async (req, res) => {
    const { nombre, correo, password, role } = req.body;

    try {
        const usuarioExistente = await Usuario.findOne({ nombre, estado: true });

        if (usuarioExistente) {
            return res.status(400).json({
                msg: 'Ya existe un usuario activo con este nombre'
            });
        }

        const usuario = new Usuario({ nombre, correo, password, role });

        const salt = bcryptjs.genSaltSync();
        usuario.password = bcryptjs.hashSync(password, salt);

        await usuario.save();

        res.status(200).json({
            usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error interno del servidor' });
    }
}


const usuariosLogin = async (req, res) => {
    const { correo, password } = req.body;

    try{
        const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
        return res.status(400).json({
            msg: 'Usuario no encontrado'
        });
    }

    if(!usuario.estado){
        return res.status(400).json({
            msg: 'Usuario borrado de la base de datos'
        })
    }

    const passwordValido = bcryptjs.compareSync(password, usuario.password);

    if (!passwordValido) {
        return res.status(400).json({
            msg: 'Contraseña incorrecta'
        });
    }

    const token = await generarJWT(usuario.id)

    res.status(200).json({
        msg_1: 'Inicio de sesión exitoso',
        msg_2: 'Bienvenido '+ usuario.nombre,
        msg_3: 'Este su token =>'+ token,
    });

    }catch(e){
        console.log(e);
        res.status(500).json({
            msg: 'Error inesperado'
        })
    }

}

module.exports = {
    usuariosDelete,
    usuariosPost,
    usuariosGet,
    usuariosPut,
    usuariosLogin
}