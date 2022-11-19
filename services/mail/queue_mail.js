const nodemailer = require('nodemailer');
const { MAIL_SETTINGS } = require('../../constants/constants');
const transporter = nodemailer.createTransport(MAIL_SETTINGS);

const fs = require('fs');
const { promisify } = require('util');
const handlebars = require('handlebars');

module.exports.sendQueueMail = async (params) => {

  const readFile = promisify(fs.readFile);
  const html = await readFile('./services/mail/template/index.html', 'utf8')
  const template = handlebars.compile(html);
  const replacements = {
    heading: "It's your turn to refill the vehicle!",
    content_one: `You can refill the registered vehicle from the following filling station on (${params.date})`,
    content_two: `Fuel station name: ${params.fsName}, ${params.city}`,
    content_three: `Registered vehicle: ${params.regNo}`,
    content_four: `Queue type: ${params.queueType}`,
    content_five: `Your queue position: ${params.position}`,
    footer: "Kindly note that you must arrive within the given date or your request will be rejected.",
  }
  const htmlToSend = template(replacements);

  try {
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.user,
      to: params.to, // list of receivers
      subject: `Refill Notification`, // Subject line
      html: htmlToSend,
    });
    return info;
  } catch (error) {
    console.log(error);
    return false;
  }
};