const nodemailer = require('nodemailer');
const { MAIL_SETTINGS } = require('../../constants/constants');
const transporter = nodemailer.createTransport(MAIL_SETTINGS);

module.exports.sendQueueMail = async (params) => {
  try {
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.user,
      to: params.to, // list of receivers
      subject: `Refill Notification`, // Subject line
      html: `
      <div
        class="container"
        style="max-width: 90%; margin: auto; padding-top: 20px"
      >
        <h2>It's your turn to refill the vehicle!</h2>
        <p style="margin-bottom: 30px;">You can refill the registered vehicle from the following filling station on (${params.date})</p>
        <h5>Fuel station name: ${params.fsName}, ${params.city}</h5>
        <h5>Registered vehicle: ${params.regNo}</h5>
        <h5>Queue type: ${params.queueType}</h5>
        <h5>Your queue position: ${params.position}</h5>
        <p style="margin-top:50px;color:crimson">Kindly note that you <b>must</b> arrive within the given date or your request will be rejected.</p>
      </div>
    `,
    });
    return info;
  } catch (error) {
    console.log(error);
    return false;
  }
};