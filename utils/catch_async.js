// It is a helper function that wraps the route handler. We directly return higher-order anonymous function b/c need to pass req,res arguments.
module.exports = fn => {
    // We need "next()" b/c we need next() to pass error to global error-handler middleware.
    return ( req , res , next ) => {
        fn( req , res , next ).catch( err => next( err ) ) ;
        // fn( req , res , next ).catch( next ) ;

        // *Another way.
        // Promise.resolve( fn( req , res , next ) ).catch( next ) ;
    } ;
} ;