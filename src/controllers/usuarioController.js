const { Usuario } = require("../db");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

const { emailRegistro, emailOlvidePassword } = require("../helpers/email");
const generarId = require("../helpers/generarId");
const generarJWT = require("../helpers/generarJWT");

const registrar = async (req, res) => {
  const { email, usuario } = req.body;

  try {
    // Verificar si ya existe un usuario con el mismo nombre de usuario
    const existeUsuario = await Usuario.findOne({ where: { usuario } });
    if (existeUsuario) {
      const error = new Error(
        "Usuario ya registrado, intenta con otro nombre de usuario"
      );
      return res.status(400).json({ msg: error.message });
    }

    // Verificar si ya existe un usuario con el mismo correo electrónico
    const existeEmail = await Usuario.findOne({ where: { email } });
    if (existeEmail) {
      const error = new Error(
        "Correo electrónico ya registrado, intenta con otro correo"
      );
      return res.status(400).json({ msg: error.message });
    }

    // Crear un nuevo usuario con los datos del cuerpo de la solicitud
    const nuevoUsuario = await Usuario.create(req.body);

    // Generar un nuevo token
    const token = generarId();

    // Asignar el token al nuevo usuario
    nuevoUsuario.token = token;

    // Guardar el nuevo usuario en la base de datos
    await nuevoUsuario.save();

    emailRegistro({
      email: nuevoUsuario.email,
      usuario: nuevoUsuario.usuario,
      token: nuevoUsuario.token,
    });

    return res.status(201).json({
      msg: "Usuario creado correctamente. Revisa tu correo electrónico para confirmar tu cuenta.",
    });
  } catch (error) {
    // Manejar errores si ocurren al buscar en la base de datos o en el proceso de registro
    console.error("Error al enviar el correo electrónico:", error);
  }
};

const autenticar = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Buscar usuario por nombre de usuario o correo electrónico
    const usuario = await Usuario.findOne({
      where: {
        [Op.or]: [{ usuario: usernameOrEmail }, { email: usernameOrEmail }],
      },
    });

    if (!usuario) {
      const error = new Error("El usuario o correo electrónico no existe");
      return res.status(404).json({ msg: error.message });
    }

    if (!usuario.confirmado) {
      const error = new Error("Tu cuenta no ha sido confirmada");
      return res.status(403).json({ msg: error.message });
    }

    // Comprobar la contraseña
    const contraseñaValida = await usuario.comprobarPassword(password);

    if (!contraseñaValida) {
      const error = new Error("Contraseña incorrecta");
      return res.status(401).json({ msg: error.message });
    }

    // Si la contraseña es válida, generar un token JWT y responder con la información del usuario
    const token = generarJWT(usuario.id);
    res.json({
      id: usuario.id,
      usuario: usuario.usuario,
      email: usuario.email,
      token,
    });
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const confirmar = async (req, res) => {
  const { token } = req.params;

  try {
    const usuarioConfirmar = await Usuario.findOne({
      where: { token: token },
    });

    if (!usuarioConfirmar) {
      const error = new Error("Token no válido");
      return res.status(403).json({ msg: error.message });
    }

    if (usuarioConfirmar.confirmado) {
      const error = new Error("El usuario ya está confirmado");
      return res.status(400).json({ msg: error.message });
    }

    // Marcar al usuario como confirmado y eliminar el token
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = "";
    await usuarioConfirmar.save();
    res.json({ msg: "Usuario confirmado correctamente" });
  } catch (error) {
    console.error("Error al confirmar usuario:", error);
    res.status(500).json({ msg: "Ocurrió un error al confirmar el usuario" });
  }
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { email: email } });

    if (!usuario) {
      const error = new Error("El Usuario no existe");
      return res.status(404).json({ msg: error.message });
    }

    usuario.token = generarId();
    await usuario.save();

    // Enviar el email
    emailOlvidePassword({
      email: usuario.email,
      usuario: usuario.usuario,
      token: usuario.token,
    });

    return res.json({
      msg: "Hemos enviado un correo electrónico con las instrucciones para restablecer la contraseña",
    });
  } catch (error) {
    console.error("Error en la función olvidar Password:", error);
    return res
      .status(500)
      .json({ msg: "Ocurrió un error al procesar la solicitud" });
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  try {
    const tokenValido = await Usuario.findOne({ where: { token: token } });

    if (tokenValido) {
      res.json({ msg: "Token válido y el Usuario existe" });
    } else {
      const error = new Error("Token no válido");
      return res.status(404).json({ msg: error.message });
    }
  } catch (error) {
    console.error("Error en comprobar Token:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { token: token } });

    if (usuario) {
      const salt = await bcrypt.genSalt(10);
      usuario.password = await bcrypt.hash(password, salt);
      usuario.token = "";
      await usuario.save();
      return res.json({ msg: "Contraseña modificada correctamente" });
    } else {
      const error = new Error("Token no válido");
      return res.status(404).json({ msg: error.message });
    }
  } catch (error) {
    console.error("Error en nuevoPassword:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

const perfil = async (req, res) => {
  const { usuario } = req;
  res.json(usuario);
};

module.exports = {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
