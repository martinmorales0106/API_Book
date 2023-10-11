const nodemailer = require("nodemailer");
require("dotenv").config();
const { MAIL_USER, MAIL_PASS, FRONTEND_URL } = process.env;

const emailRegistro = async (datos) => {
  const { email, usuario, token } = datos;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: MAIL_USER, // Reemplaza con tu dirección de correo electrónico de Gmail
      pass: MAIL_PASS, // Reemplaza con la contraseña de aplicación generada
    },
  });

  try {
    await transporter.sendMail({
      from: MAIL_USER,
      to: email,
      subject: "BookScape - Comprueba tu cuenta",
      text: "Comprueba tu cuenta en BookScape",
      html: `
        <div style="background-color: #F4F4F4; padding: 50px;">
          <div style="background-color: #FFFFFF; padding: 20px; border-radius: 5px;">
            <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 18px; color: #55575d; font-weight: bold; text-align: center;">
              Hola: ${usuario},
            </p>
            <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 16px; color: #55575d; text-align: center;">
              Tu cuenta de BookScape ya está casi lista, solo debes comprobarla en el siguiente enlace:
            </p>
            <p style="text-align: center;">
              <a href="${FRONTEND_URL}/confirmar/${token}" style="display: inline-block; padding: 10px 20px; background-color: #b60101; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 16px; border-radius: 5px;">
                Comprobar Cuenta
              </a>
            </p>
            <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 16px; color: #55575d; text-align: center;">
              Si tú no creaste esta cuenta, puedes ignorar el mensaje.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.log(error);
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

const emailOlvidePassword = async (datos) => {
  const { email, usuario, token } = datos;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: MAIL_USER, // Reemplaza con tu dirección de correo electrónico de Gmail
      pass: MAIL_PASS, // Reemplaza con la contraseña de aplicación generada
    },
  });

  try {
    await transporter.sendMail({
      from: MAIL_USER,
      to: email,
      subject: "BookScape - Restablece tu password",
      text: "Restablece tu Password",
      html: `
        <div style="background-color: #F4F4F4; padding: 50px;">
          <div style="background-color: #FFFFFF; padding: 20px; border-radius: 5px;">
            <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 18px; color: #55575d; font-weight: bold; text-align: center;">
              Hola: ${usuario},
            </p>
            <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 16px; color: #55575d; text-align: center;">
            has solicitado restablecer tu password
            </p>
            <p style="text-align: center;">
              <a href="${FRONTEND_URL}/olvide-password/${token}" style="display: inline-block; padding: 10px 20px; background-color: #b60101; color: #ffffff; text-decoration: none; font-family: Arial, sans-serif; font-size: 16px; border-radius: 5px;">
              Restablecer Password
              </a>
            </p>
            <p style="font-family: Ubuntu, Helvetica, Arial, sans-serif; font-size: 16px; color: #55575d; text-align: center;">
            Si tu no solicitaste este email, puedes ignorar el mensaje.
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.log(error);
    console.error("Error al recuperar el usuario:", error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

module.exports = { emailRegistro, emailOlvidePassword };
