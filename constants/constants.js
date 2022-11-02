require('dotenv').config();

module.exports = {
    OTP_LENGTH: 6,
    OTP_CONFIG: {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    },
    MAIL_SETTINGS: {
      service: 'gmail',
      auth: {
        user: process.env.MAIL_EMAIL,
        pass: process.env.MAIL_PASSWORD,
      },
    },
  };