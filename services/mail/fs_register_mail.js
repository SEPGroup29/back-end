const nodemailer = require('nodemailer');
const { MAIL_SETTINGS } = require('../../constants/constants');
const transporter = nodemailer.createTransport(MAIL_SETTINGS);

module.exports.sendFsRegMail = async (params) => {
  try {
    let info = await transporter.sendMail({
      from: MAIL_SETTINGS.auth.user,
      to: params.to, // list of receivers
      subject: 'Manager Account Created', // Subject line
      html: `
      <div
        class="container"
        style="max-width: 90%; margin: auto; padding-top: 20px"
      >
        <h2>Welcome to FuelQ.</h2>
        <p style="margin-bottom: 30px;">You were added as a Fuel Station Manager of ${params.name} in ${params.nearCity}</p>
        <p style="margin-bottom: 30px;">Your login credentials are as follows:</p>
        <h6 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.to}</h6>
        <h6 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.password}</h6>
        <p style="margin-bottom: 30px;">If you're not a Fuel Station Manager reply to this email</p>

        
      </div>
    `,
    });
    return info;
  } catch (error) {
    console.log(error);
    return false;
  }
};