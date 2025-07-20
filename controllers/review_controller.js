const Review = require( '../models/review_model' ) ;
const factory = require( './handler_factory' ) ;

exports.setTourUserIds = ( req , res , next ) => {
    // Nested routes setup via middleware.
    if( !req.body.tour ) // Don't need to check as already setup in auth_controller.
        req.body.tour = req.params.tourId ;
    if( !req.body.user )
        req.body.user = req.user.id ;
    next() ;    
} ;

exports.getAllReviews = factory.getAll( Review ) ;
exports.createReview = factory.createOne( Review ) ;
exports.updateReview = factory.updateOne( Review ) ;
exports.deleteReview = factory.deleteOne( Review ) ;