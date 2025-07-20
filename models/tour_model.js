const mongoose = require('mongoose') ;
const slugify = require('slugify') ;

// 2 arguments are "schema-definitions" and "schema-options".
const tourSchema = new mongoose.Schema( {
    name: {
        type: String,
        unique: true,
        trim: true,
        required: [true, 'A tour must have a name'], // Custom Error using "Validator".
        // These 2 are only available for Strings.
        minlength: [10, 'A tour name must have atleast 10 characters'],
        maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        // match: [/^[a-zA-Z\s]+$/, 'Tour name must only contain letters and spaces']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price must have a value']
    },
    discount: {
        type: Number,
        validate: {
            // ? Here "this" keyword will only point to current-doc when creating a new DOC not while UPDATING doc.
            validator: function(val) { 
                return val < this.price ;
            },
            // message: props => `${props.value} should be below regular price`
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true, 
        required: [true, 'A tour must have a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String, // For name/path of image file.
        required: [true, 'A tour must have a cover image']
    },
    images: [String] ,
    createdAt: {
        type: Date,
        default: Date.now ,
        select: false // To hide sensitive or unnecessary fields.
    },
    startDates: [Date],
    slug: String,
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON ; For Geospatial Data Object must have type and coordinates.
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']  
        },
        coordinates: [Number] , // (long, lat) Reverse of Original Format For GeoJSON.
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']  
            },
            coordinates: [Number] , 
            address: String,
            description: String,
            day: Number // On which day this location will be visited.
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId, 
            ref: 'User'
        }
    ]
} , 
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
} ) ;

tourSchema.index( { price: 1 , ratingsAverage: -1 } ) ; // ? This compound index will also work for price-index alone BUT NOT for ratingsAverage-index alone as its sorted based on price 1st not solely on ratingsAverage.
tourSchema.index( { slug: 1 } ) ;
tourSchema.index( { startLocation: '2dsphere' } ) ; // ? It supports queries that calculate geometries on an Earth-like sphere. It is mandatory for MOST GeoJSON queries like $geoNear BUT $geoWithin with $centerSphere doesn't strictly require it although query would be slower.


// Virtual Properties are fields that are not stored in DB so to separate Application-logic from Business one.
tourSchema.virtual('durationWeeks').get( function () {
    return this.duration / 7 ;
} ) ;

// We would want to use populate() on getTour only NOT all-Tours as that would be costly to send too much info to client ALSO overview page of allTours shouldn't have all reviews info. 
// Virtual Populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
} ) ;

tourSchema.pre( 'save' , function ( next ) {
    // console.log( this ) ; // Currently saving doc-object.
    this.slug = slugify( this.name , { lower: true } ) ;
    next() ;
} ) ;

// ? We won't be able to use this hook for single Tour as we are using findById which uses findOne() internally. So we use regExp to use for all queries starting with "find".
tourSchema.pre( /^find/ , function ( next ) {
    this.find( { secretTour: { $ne: true } } ) ; // Used !== true AS prevOnes are not-set i.e. "null" or "undefined". Mongoose is giving output "false" by itself for all previous ones as we defined default ALTHOUGH they are not set in MONGO-DB originally.
    next() ;    
} ) ;

tourSchema.pre( /^find/ , function ( next ) {
    // ? .populate() internally runs a User.find({ _id: { $in: [...] } }) query so all User-models find-hooks will be executed under the hood.
    this.populate( {
        path: 'guides',
        select: '-__v -passwordChangedAt'
    } ) ;     
    next() ;
} ) ;

const Tour = mongoose.model( 'Tour' , tourSchema ) ;
module.exports = Tour ;
