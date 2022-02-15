import nodemaller, { SendMailOptions } from "nodemailer";
import config from "config";
import log from "./logger";

// async function createTestCreds() {
//   const creds = await nodemaller.createTestAccount();

//   console.log(creds);
// }

// createTestCreds();
const smtp = config.get<{
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
}>("smtp");

const transporter = nodemaller.createTransport({
  ...smtp,
  auth: {
    user: smtp.user,
    pass: smtp.pass,
  },
});

async function sendEmail(payload: SendMailOptions) {
  transporter.sendMail(payload, (err, info) => {
    if (err) {
      log.error(err, "could not send email");
      return;
    }

    log.info(`Preview URL: ${nodemaller.getTestMessageUrl(info)}`);
  });
}

export default sendEmail;
