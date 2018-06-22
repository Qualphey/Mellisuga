
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const MailParser = require("mailparser-mit").MailParser;

const sanitizer = require('sanitizer');

module.exports = class {
  constructor(cms, cfg) {
    this.cms = cms;
    this.host = cfg.host;
    this.port = cfg.port;


  }

  static async init(cms, cfg) {
    try {
      let this_class = new module.exports(cms, cfg);
    
      if (cfg.gmail) {
        this_class.transporter = nodemailer.createTransport(cfg.gmail);
      } else {
        this_class.transporter = nodemailer.createTransport({
          host: cfg.host,
          port: cfg.port,
          secure: false
        });
      }
      
      await new Promise(function(resolve) {
        function timeout() {
          console.error("SMTP connection timeout!");
          resolve();
        }

        let timeout_ms = cfg.timeout || 5000;

        const timeout_id = setTimeout(timeout, timeout_ms);
        this_class.transporter.verify(function(error, success) {
          if (error) {
            console.log(error);
          } else {
            clearTimeout(timeout_id);
            resolve();
          }
        });
      });

      cms.app.get("/mailer.io", function(req, res) {
        let data = JSON.parse(req.query.data);
        
        console.log(data);

        switch(data.command) {
          case 'send_public':
            if (data.from && data.to && data.full_name && data.subject && data.text) {
              function validateEmail(email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(String(email).toLowerCase());
              }

              let err = false;
              let errs = [];

              if (!validateEmail(data.from)) {
                err = true;
                errs.push("email");
              }             
              if (err) {
                res.send({ err : errs });  
              } else {
                data.text = sanitizer.sanitize(data.text);
                let mailOptions = {
                  from: '"'+data.full_name+'"<'+data.from+'>',
                  to: data.to,
                  subject: data.subject,
                  text: data.text,
                  html: data.text
                };

                this_class.transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                    res.send({ err: error });
                    return console.error(error);
                  } else {
                    res.send({ success: "success"});
                  }
                  console.log('Message sent: %s', info.messageId);
                  // Preview only available when sending through an Ethereal account
                  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                
                  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                });
              }
            } else {
              res.status(400);
              res.send("Bad Request");
            }
            break;
          default:
            res.status(400);
            res.send("Bad Request");
        }
      });

      cms.app.post("/mailer.io", async function(req, res) {
        try {
          let data = JSON.parse(req.body.data);
          switch(data.command) {
            case 'all':
              let new_mail_path = path.resolve(cms.app_path, 'Mailbox/new');
              let new_emails = fs.readdirSync(new_mail_path);
              new_emails.sort(function(a, b) {
                return fs.statSync(path.resolve(new_mail_path, b)).mtime.getTime() -
                  fs.statSync(path.resolve(new_mail_path, a)).mtime.getTime();
                  
              });
                
              for (let n = 0; n < new_emails.length; n++) {
                let email = fs.readFileSync(path.resolve(new_mail_path, new_emails[n]), 'utf8');
                await new Promise(function(resolve) {
                  let mailparser = new MailParser();
                  mailparser.on("end", function(mail_object){
                    mail_object.filename = new_emails[n];

                    mail_object.text = sanitizer.sanitize(mail_object.text);
                    mail_object.html = sanitizer.sanitize(mail_object.html);

                    new_emails[n] = mail_object;
                    resolve();
                  });

                  // send the email source to the parser
                  mailparser.write(email);
                  mailparser.end();
                });   
              }


              res.send(new_emails);
              break;
            case 'rm':
              if (data.filename) { 
                let rm_mail_path = path.resolve(cms.app_path, 'Mailbox/new', data.filename);
                fs.unlinkSync(rm_mail_path);
                res.send('success');
              } else {
                res.send("no filename!");
              }
              break;
            default:
              res.status(400);
              res.send("Bad Request");
          }

        } catch (e) {
          console.error(e.stack);
        }
      });
      
      return this_class;
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }
  }
}
