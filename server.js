const dotenv = require('dotenv') ;
dotenv.config( { path: './config.env' } ) ;

process.on( 'uncaughtException' , err => {
    console.log( err.name , err.message ) ;
    console.log('Uncaught Exception! Shutting down...') ;
    process.exit(1) ; // It is compulsory as due to this entire Node process will be in uncleaned state so to fix that we need to terminate AND restart. Also since these errors don't occur asynchronously so don't need to handle server.
} ) ;

const mongoose = require('mongoose') ;
const app = require('./app') ;

const DB = process.env.DATABASE.replace( '<db_password>' , process.env.DATABASE_PASSWORD ) ;
mongoose.connect( DB , {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
} ).then( ( ) => {
    console.log('DB connection successful!') ;
} ) ;

const port = process.env.PORT || 300 ;
const server = app.listen( port , () => {
    console.log(`Listening to sever http://127.0.0.1:${port}`) ;
} ) ;

// It will handled all unhandled Rejections inside/outside of Routes i.e. Express. like no DB connection etc.
process.on( 'unhandledRejection' , err => {
    console.log( err.name , err.message ) ;
    console.log('Unhandled Rejection! Shutting down...') ;

    server.close( () => {
        mongoose.connection.close( () => process.exit(1) ) ;
    } ) ;
} ) ;