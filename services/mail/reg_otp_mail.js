const nodemailer = require('nodemailer');
const { MAIL_SETTINGS } = require('../../constants/constants');
const transporter = nodemailer.createTransport(MAIL_SETTINGS);

const fs = require('fs');
const { promisify } = require('util');
const handlebars = require('handlebars');

module.exports.sendRegOtpMail = async (params) => {

  const readFile = promisify(fs.readFile);
  const html = await readFile('./services/mail/template/index.html', 'utf8')
  const template = handlebars.compile(html);
  const replacements = {
    heading: "Welcome to FuelQ!",
    content_one: `Please enter the sign up OTP to continue the registration`,
    content_two: `${params.OTP}`,
    footer: "If you do not request for verification please do not respond to the mail.",
  }
  const htmlToSend = template(replacements);

  try {
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.user,
      to: params.to, // list of receivers
      subject: 'Hello', // Subject line
      html: htmlToSend,
    });
    return info;
  } catch (error) {
    console.log(error);
    return false;
  }
};