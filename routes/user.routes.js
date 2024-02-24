const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { existenteEmail } = require('../helpers/db-validators');

const { usuariosPost, usuariosGet, usuariosPut, usuariosDelete, usuariosLogin } = require('../controllers/user.controller.js');

const router = Router();

router.get("/", usuariosGet);

router.put(
    "/:id",
    [
        check("nombre", "El nombre es obligatorio").not().isEmpty(),
        validarCampos
    ], usuariosPut);


router.delete(
    "/:id",
    [
        check("id", "El id no es un formato válido de MongoDB").isMongoId(),
        validarCampos
    ], usuariosDelete);

router.post(
    "/",
    [
        check("nombre", "El nombre es obligatorio").not().isEmpty(),
        check("password", "El password debe tener más de 6 letras").isLength({ min: 6 }),
        check("correo", "El correo debe ser un correo").isEmail(),
        check("correo").custom(existenteEmail),
        validarCampos,
    ], usuariosPost);

router.post(
    "/login",
    [
        check('correo', 'Este correo no es valido').isEmail(),
        check('password', 'La Password es necesaria.').not().isEmpty(),
        validarCampos,
    ],
    usuariosLogin);

module.exports = router;
