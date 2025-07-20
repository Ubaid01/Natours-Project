const nodemailer = require('nodemailer') ;
const pug = require('pug') ;
const { convert } = require('html-to-text');

module.exports = class Email {
    constructor( user , url ) {
        this.to = user.email ;
        this.firstName = user.name.split(' ')[0] ;
        this.url = url ;
        this.from = `M.OBAID <${process.env.EMAIL_FROM}>` ;
    }


    // ? MY-MISTAKE ; Since "sendEmail" is NOT a route-handler OR middleware, so it can't receive req/res/next arguments. Hence wrapping it in catchAsync will give TypeError: next is not a function.
    createTransport() {
        if( process.env.NODE_ENV === 'production' )
            return nodemailer.createTransport( {
                service: 'SendGrid' , // It is a predefined service for NodeMailer. Also use disposable email like "mailsec" service to test it.
                auth: {
                    user: process.env.SENDGRID_USERNAME ,
                    pass: process.env.SENDGRID_PASSWORD
                }
            } ) ;
    
        return nodemailer.createTransport( {
            // service: 'Gmail' , Set up an App Password (2FA must be enabled) to send emails since "less secure app" option is deprecated.
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT ,
            auth: {
                user: process.env.EMAIL_USERNAME ,
                pass: process.env.EMAIL_PASSWORD
            }
        } ) ;
    }

    async send( template , subject ) {
        // 1) Render HTML based on a pug template
        const html = pug.renderFile( `${__dirname}/../views/emails/${template}.pug` , {
            firstName: this.firstName ,
            url: this.url ,
            subject
        } ) ;

        // 2) Define email options
        const mailOptions = {
            from: this.from ,
            to: this.to ,
            subject ,
            html ,
            text: convert( html ) // Convert HTML-string to plain text for better email deliverability , SPAM folders and to support clients that don't display HTML.
        } ;

        // 3) Create a transport and send email
        await this.createTransport().sendMail( mailOptions ) ;
    }

    // Helper functions for different emails.
    async sendWelcome() {
        await this.send( 'welcome' , 'Welcome to the Natours Family!' ) ;
    }

    async sendPasswordReset() {
        await this.send( 'password_reset' , 'Your password reset token (valid for only 10 minutes)' ) ;
    }
} ;