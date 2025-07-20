const AppError = require('../utils/app_error') ;

const handleCastErrorDB = ( err ) => {
    const message = `Invalid ${err.path}: ${err.value}` ;
    return new AppError( message , 400 ) ;
} ;

const handleDuplicateFieldsDB = ( err ) => {
    const value = err.message.match( /(["'])(\\?.)*?\1/ )[0] ; // Match tags b/w quotes.
    // value = value.replace( /['"]+/g , '' ) ;
    const message = `Duplicate field value: ${ value }. Please use another value!` ;
    return new AppError( message , 400 ) ;
} ;

const handleValidationErrorDB = ( err ) => {
    const errors = Object.values( err.errors ).map( el => el.message ) ; // Extracts an array of all values then get all error-msg in str array.
    const message = `Invalid input data. ${ errors.join( '. ' ) }` ;
    return new AppError( message , 400 ) ;
} ;

const handleJWTError = () => new AppError( 'Invalid token. Please login again!' , 401 ) ; // It will implicitly return for 1-liners.
const handleJWTExpiredError = () => new AppError( 'Your token has expired! Please login again.' , 401 ) ;

const sendErrorDev = ( err , req , res ) => { 
    if( req.originalUrl.startsWith( '/api' ) ) {
        return res.status( err.statusCode ).json( {
            status: err.status ,
            error: err ,
            message: err.message,
            stack: err.stack
        } ) ;
    }

    res.status( err.statusCode ).render( 'error' , {
        title: 'Something went wrong!',
        msg: err.message
    } ) ;
} ;

const sendErrorProd = ( err , req , res ) => {
    // a) API
    if( req.url.startsWith( '/api' ) ) {
        // Only send operational errors to clients.
        if( err.isOperational ) {
            return res.status( err.statusCode ).json( {
                status: err.status ,
                message: err.message
            } ) ;
        }

        // Send generic message don't leak information to client but log it.
        console.error( 'ERROR 💥: ' , err ) ;
        
        return res.status( 500 ).json( {
            status: 'error' ,
            message: 'Something went very wrong...'
        } ) ;
    }
    
    // b) Rendered Templates.
    if( err.isOperational ) {
        return res.status( err.statusCode ).render( 'error' , {
            title: 'Something went wrong!' ,
            msg: err.message
        } ) ;
    }
    
    console.error( 'ERROR 💥: ' , err ) ;
    res.status( 500 ).render( 'error' , {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    } ) ;
} ;

module.exports = ( ( err , req , res , next ) => {

    err.statusCode = err.statusCode || 500 ;
    err.status = err.status || 'error' ;

    if( process.env.NODE_ENV === 'development' )
        sendErrorDev( err , req , res ) ;
    else if( process.env.NODE_ENV === 'production' ) {

        // let error = { ...err } ; // It was not copying properly as only top-level enumerable properties were copied BUT NOT the non-enumerable properties from Error-prototype.
        let error = Object.create( err ) ; // Now properly hardCopy created but with Shallow prototype inheritance (not a clone!)

        if( error.name === 'CastError' ) 
            error = handleCastErrorDB( error ) ; // Mongoose Error
        if( error.code === 11000 )
            error = handleDuplicateFieldsDB( error ) ; // It is due to underlined MongoDB driver.
        if( error.name === 'ValidationError' )
            error = handleValidationErrorDB( error ) ; // Mongoose Error.
        if( error.name === 'JsonWebTokenError' )
            error = handleJWTError( error ) ;
        if( error.name === 'TokenExpiredError' )
            error = handleJWTExpiredError( error ) ;

        sendErrorProd( error , req , res ) ;
    }
    // next() ; // Last error handle middleware so no need of next().
} ) ;