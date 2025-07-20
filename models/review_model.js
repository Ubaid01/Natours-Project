const mongoose = require('mongoose') ;
const Tour = require('./tour_model') ;

const reviewSchema = new mongoose.Schema( {
    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating: {
        type: Number,
        min: [1, 'Review Rating must be above 1.0'],
        max: [5, 'Review Rating must be below 5.0']
    },
    createdAt : {
        type: Date,
        default: Date.now // ? Use function reference instead of calling Date.now(), because calling it assigns the same timestamp to all new docs — equal to the time when the server started.
    },
    // Parent referencing.
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour!']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must be written by a user!']
    }
} , 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
) ;

// ? Doing this in controller is not efficient b/c in race conditions (two reviews submitted at the same time by same user to same tour), duplicates can still be inserted. But a unique index in MongoDB is atomic and enforced at the database level — so it's bulletproof.
reviewSchema.index( { tour: 1 , user: 1 } , { unique: true } ) ; // Make Compound-Index as unique to avoid duplicate reviews.

reviewSchema.pre( /^find/ , function( next ) {
    // ? Only populate user, not tour to avoid circular nesting via virtual populate.
    this.populate( { 
        path: 'user' , 
        select: 'name photo'
    } ) ;    
    next() ;
} ) ;

// Static Methods are methods you define on the Model itself, not on individual documents. As need to use aggregate() here so used "static-method" to get whole Model via "this".
reviewSchema.statics.calcAverageRatings = async function( tourId ) {
    const stats = await this.aggregate( [
        {
            $match: { tour: tourId } // "tour" is field in reviewSchema.
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ] ) ;
    // console.log( stats ) ;

    if( stats.length > 0 ) {
        await Tour.findByIdAndUpdate( tourId , {
            ratingsQuantity: stats[0].nRating ,  // If we have no review-docs left so it will return undefined OR []. HENCE rollback to default ones.
            ratingsAverage: stats[0].avgRating
        } ) ;
    }
    else {
        await Tour.findByIdAndUpdate( tourId , {
            ratingsQuantity: 0 ,
            ratingsAverage: 4.5
        } ) ;
    }
} ;

// ? If we move this after "Review" declaration then it will not work as then reviewSchema will not attach this middleware while compiling the model with mongoose.model() (As JS synchronous code runs line by line). So used this.constructor
// Use "post" here NOT "pre" as that review-doc will NOT be saved yet. ALSO post() doesn't need next() call.
reviewSchema.post('save' , function( ) {
    this.constructor.calcAverageRatings( this.tour ) ;
} ) ;

// As findByIdAndDelete() = findOneAndDelete() ( Course Method )
// reviewSchema.pre( /^findOneAnd/ , async function( next ) {
//     this.rev = await this.findOne() ; // ? Here "this" refers to current query object NOT doc. So get the doc first.
//     // console.log( this.rev ) ;
//     next() ;
// } ) ;

reviewSchema.post( /^findOneAnd/ , async function( doc ) {
    // We can't use this.findOne() in "post" middleware as then query will already have been executed so can't await again.
    // console.log( doc ) ;

    // if( this.rev )
    //     await this.rev.constructor.calcAverageRatings( this.rev.tour ) ; // ? Now we can have access to Model directly via "this.rev.constructor" then call static-methods via that.

    if( doc ) // To check if Model-doc exists OR not as if whole Model is empty then it will pass "doc === null."
        await doc.constructor.calcAverageRatings( doc.tour ) ;
} ) ;

const Review = mongoose.model( 'Review' , reviewSchema ) ;
module.exports = Review ;