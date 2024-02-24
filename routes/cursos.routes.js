const express = require('express');
const router = express.Router();
const { cursosGet, cursosPut, cursosDelete, cursosPost } = require('../controllers/cursos.controller');
const { validarCampos, validarRolTeacher } = require("../middlewares/validar-campos");
const { existeCursoByNombre, existeCursoById } = require("../helpers/db-validators");
const { check } = require("express-validator");

router.get('/', cursosGet);

router.put('/:id', [
    check("nombre").optional(),
    check("nombre").custom((value, { req }) => {
        if (req.body.nombre && req.body.nombre !== value) {
            return existeCursoByNombre(value);
        }
        return true;
    }),
    check("maestroId", "Debe proporcionar la ID del maestro.").isMongoId(),
    validarCampos,
    validarRolTeacher
], cursosPut);


router.delete('/:id', [
    check("id", "El id no es un formato válido de MongoDB").isMongoId(),
    check("id").custom(existeCursoById),
    validarCampos,
    validarRolTeacher
], cursosDelete);

router.post('/', [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("nombre").custom(existeCursoByNombre),
    check("maestro", "Debes escribir tu correo").isEmail(),
    validarCampos
], cursosPost);

module.exports = router;
