const { Router } = require("express");
const {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
} = require("../controllers/usuarioController");
const checkAuth = require("../middleware/checkAuth");

const routeUsuarios = Router();

routeUsuarios.post("/", registrar);
routeUsuarios.post("/login", autenticar);
routeUsuarios.get("/confirmar/:token", confirmar);
routeUsuarios.post("/olvide-password", olvidePassword);
routeUsuarios
  .route("/olvide-password/:token")
  .get(comprobarToken)
  .post(nuevoPassword);
routeUsuarios.get("/perfil",checkAuth, perfil);

module.exports = routeUsuarios;
