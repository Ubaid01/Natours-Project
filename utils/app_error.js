class AppError extends Error {
    constructor( message , statusCode ) {
        super( message ) ;

        this.statusCode = statusCode ;
        this.status = `${statusCode}`.startsWith( '4' ) ? 'fail' : 'error' ;
        this.isOperational = true ; // As we will only handle operational errors via this.

        Error.captureStackTrace( this , this.constructor ) ; // To excludes constructor functions from appearing in the stack trace.
    }
} ;

module.exports = AppError ;