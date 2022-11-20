const nodemailer = require('nodemailer');
const { MAIL_SETTINGS } = require('../../constants/constants');
const transporter = nodemailer.createTransport(MAIL_SETTINGS);

const fs = require('fs');
const { promisify } = require('util');
const handlebars = require('handlebars');

module.exports.sendRegSuccessMail = async (params) => {
  
  const readFile = promisify(fs.readFile);
  const html = await readFile('./services/mail/template/temp.html', 'utf8')
  const template = handlebars.compile(html);
  const replacements = {
    heading: "Welcome to the FuelQ!",
    content_one: `You are officially In ✔`,
    footer: "You have successfully registered to the system as a vehicle owner.",
  }
  const htmlToSend = template(replacements);

  try {
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.user,
      to: params.to, // list of receivers
      subject: 'FuelQ - Registration Successful', // Subject line
      html: htmlToSend,
    });
    return info;
  } catch (error) {
    console.log(error);
    return false;
  }
};