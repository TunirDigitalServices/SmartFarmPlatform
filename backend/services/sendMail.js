const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const Report = require('../models/Report');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  port: process.env.SMTP_PORT,               // true for 465, false for other ports
  host: process.env.SMTP_HOST,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  secure: true,
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
});

const sendmail = async (mail, type, data) => {
  let subjectMail = "";
  let htmlBody = "";
  let htmlBodyAdmin = ''
  let offerType = ""
  if (data.offer === "2") {
    offerType = "Premium"
  }
  if (data.offer === "1") {
    offerType = "Freemium"

  }
  if (type === 'signup') {
    subjectMail = 'Confirm account';
    htmlBody = ' <p><center><strong>Welcome to SmartFarm</strong></center> </p> <br /> <br /> <br />  <p> Dear <strong>' + data.name + '</strong> <br/> <br/> <p>Thank you for signing up for SmartFarm . We \'re really happy to have you .<br/> </p> Tap the link below from  your desktop to finish logging into SmartFarm </p> <br/> The link is valid for 1h <br/> <br/> Link to confirm your mail : <a href=' + data.link + '/Valid/' + data.token + ' target="_blank"><strong> Click To Confirm </strong></a> <br /> <br /> If your on mobile device please copy the link below into your browser : <br /> <br />  <strong>' + data.link + '/Valid/' + data.token + '</strong> <br /> <br /> <br /> <br />  Best regards, <br /> <br /> <strong> SmartFarm </strong> <br /> <br /> <strong>  contact@smartfarm.com.tn </strong>  ';
    htmlBodyAdmin = '<p><p><center><strong>A new User joins our SmartFarm family </strong></center> </p> <br /> <br /> <br /> <strong>UserName</strong> :' + data.name + '<br/> <br/> <strong>Email</strong> : ' + mail + '<br/> <br/>  <strong>Offer</strong> : ' + offerType + ' <br/> <br/> <strong>Phone</strong> : ' + data.phone + ' <br/> <br/> </p>'
    if (data.role === "ROLE_SUPPLIER" || data.offer === "2") {
      htmlBody += '<br/> <p>Our commercial will connect you to confirm your account</p>'
      htmlBodyAdmin += '<br/> <p>A user want to confirm his account</p>'
    }
  }
  if (type === 'forgotPassword') {
    subjectMail = 'Change password';
    htmlBody = '<p><center><strong>Password Reset</strong></center> </p> <br /> <br /> <br /> <p>If you \'ve lost your password or wish to reset it ,use the link below to get started</p> <br /> <br /> <br /> Link to change password : <a href=' + data.link + '/NewPassword/' + data.token + ' target="_blank"> Reset Your Password </a>';
    htmlBodyAdmin = '<p><p><center><strong>A user want to change his password  </strong></center> </p> <br /> <br /> <br/> <strong>Email</strong> : ' + mail + ' </p>'

  }

  if (type === 'end_subscription') {
    subjectMail = 'STOP subscription !';
    htmlBody = 'end_subscription';
    if (data) {
      htmlBody = 'end_subscription for user name : ' + data.name + ' email user : ' + data.email;
    }

  }

  /*switch (type) {
      case 'signup': {
          subjectMail = 'Confirm account !';
          htmlBody = 'Link to confirm your mail : <a href='+ data.link+'/valid-account/'+data.token+' target="_blank"> click here to confirm </a>';
      }
      case 'forgotPassword': {
          subjectMail = 'Change password !';
          htmlBody = 'Link to change password : <a href='+ data.link+'/valid-forgot-password/'+data.token+' target="_blank"> click here to change password </a>';
      }
    }*/
  const mailData = {
    from: '"Smart Farm" contact@sspro.tn',  // sender address
    to: mail,   // list of receivers
    subject: subjectMail,
    html: htmlBody,
  };
  const mailDataToAdmin = {
    from: '"Smart Farm" contact@sspro.tn',  // sender address
    to: process.env.MAIL_ADMIN,   // list of receivers
    subject: subjectMail,
    html: htmlBodyAdmin,
  };

  transporter.sendMail(mailDataToAdmin, function (err, info) {
    if (err) { console.log(err) }
    else {
      transporter.sendMail(mailData, function (err, info) {
        if (err) console.log(err)
        //else
        //console.log(info);
      });

    }
  });
}

const sendMailSensorState = async (req, res) => {
  try {
    const { userEmail, sensorState, sensorInfo } = req.body;
    const subject = 'Sensor Status Notification';
    const body = `
            Sensor with code ${sensorInfo.sensorCode} is in ${sensorState} state.
            Owner Name: ${sensorInfo.ownerName === '' ? '-' : sensorInfo.ownerName}
            Last Data Time: ${new Date(sensorInfo.lastDataTime)}
            Supplier Name: ${sensorInfo.supplierName === '' ? '-' : sensorInfo.supplierName}
          `;
    // Email content
    const mailOptions = {
      from: 'contact@smartfarm.com.tn',
      to: 'contact@smartfarm.com.tn',
      subject: subject,
      text: body,
    };

    //   await transporter.sendMail(mailOptions);

    res.status(200).json({ type: 'success', message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: 'danger', message: 'Error sending email' });
  }
}

const sendReportByMail = async (req, res) => {
  try {
    const { reportId, userId } = req.body;
    const report = await new Report({ 'id': reportId }).fetch({ require: false })
    const user = await new User({ 'id': userId }).fetch({ require: false })

    if (!report) {
      res.status(409).json({ type: 'danger', message: 'Report not found' })
    }

    if (!user) {
      res.status(409).json({ type: 'danger', message: 'User not found' })
    }
    const userEmail = user.get('email')
    const fileName = report.get('filename')
    const createdAt = report.get('created_at')

    const subject = 'Report Hebdomadaire';
    const body = `
            Cher ${user.get('name')},

            Nous espérons que cet e-mail vous trouvera bien. Ci-joint le rapport hebdomadaire.

            Détails du rapport :
                - Date du rapport : ${new Date(createdAt).toLocaleDateString()}

            Merci d'utiliser nos services.

            Cordialement,
            L'équipe SmartFarm
         `;
    const filePath = `docs/${fileName}`;

    const mailOptions = {
      from: 'contact@smartfarm.com.tn',
      to: userEmail,
      subject: subject,
      text: body,
      attachments: [
        {
          path: filePath,
          // Customize the filename as needed
          filename: 'Report.pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ type: 'success', message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ type: 'danger', message: 'Error sending email' });
  }
}
module.exports = { sendmail, sendMailSensorState, sendReportByMail };
