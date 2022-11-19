const nodemailer = require('nodemailer');
const { MAIL_SETTINGS } = require('../../constants/constants');
const transporter = nodemailer.createTransport(MAIL_SETTINGS);

const fs = require('fs');
const { promisify } = require('util');
const handlebars = require('handlebars');

module.exports.sendFsRegMail = async (params) => {

  const readFile = promisify(fs.readFile);
  const html = await readFile('./services/mail/template/index.html', 'utf8')
  const template = handlebars.compile(html);
  const replacements = {
    heading: "Welcome to FuelQ!",
    content_one: `You were added as a Fuel Station Manager of ${params.name} in ${params.nearCity}`,
    content_two: `Your login credentials are as follows:`,
    content_three: `${params.to}`,
    content_four: `${params.password}`,
    footer: "If you're not a Fuel Station Manager reply to this email",
  }
  const htmlToSend = template(replacements);

  try {
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.user,
      to: params.to, // list of receivers
      subject: 'Manager Account Created', // Subject line
      html: htmlToSend,
    });
    return info;
  } catch (error) {
    console.log(error);
    return false;
  }
};