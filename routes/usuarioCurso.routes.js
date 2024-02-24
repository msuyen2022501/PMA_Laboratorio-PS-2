const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos, validarRolTeacher } = require('../middlewares/validar-campos');
const { noExistenteEmail } = require('../helpers/db-validators');

const { usuarioCursoPost, usuarioCursoGet } = require('../controllers/usuarioCurso.controller');

const router = Router();

router.get("/", usuarioCursoGet);

router.post(
    "/", 
    [
        check("correo","El estudiante  es  obligatorio.").not().isEmpty(),
        check("materia","El curso es obligatorio.").not().isEmpty(),
        validarCampos,
    ], usuarioCursoPost); 

module.exports = router;
