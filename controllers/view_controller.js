const Tour = require('../models/tour_model') ;
const Booking = require('../models/booking_model') ;
const User = require('../models/user_model') ;
const catchAsync = require('../utils/catch_async') ;
const AppError = require('../utils/app_error') ;

exports.getOverview = catchAsync( async ( req , res , next ) => {
    const tours = await Tour.find() ;
    res.status(200).render('overview', {
        title: 'All Tours' ,
        tours
    } ) ;
} ) ;

exports.getTour = catchAsync( async ( req , res , next ) => {
    const tour = await Tour.findOne( { slug: req.params.slug } ).populate( {
        path: 'reviews' ,
        fields: 'review rating user'
    } ) ;
    if( !tour )
        return next( new AppError( 'There is no tour with that name.' , 404 ) ) ;

    res.status(200).render('tour', {
        title: `${tour.name} Tour` ,
        mapboxToken: process.env.MAPBOX_ACCESS_TOKEN , // env-variables are only accessible on the server side in Node.js.
        mapboxStyle: process.env.MAPBOX_STYLE ,
        tour 
    } ) ;
} ) ;

exports.getSignupForm = ( req , res ) => {
    res.status(200).render('signup', {
        title: 'Create New Account'
    } ) ;
} ;

exports.getLoginForm = ( req , res ) => {
    res.status( 200 ).render( 'login' , {
        title: 'Log into your account'
    } ) ;
} ;

exports.getAccount = ( req , res ) => {
    res.status( 200 ).render( 'account' , {
        title: 'Your account'
    } ) ; 
} ;

exports.getMyTours = catchAsync( async ( req , res , next ) => {
    // *Without Virtual Populate* 
    // 1) Find all bookings
    const bookings = await Booking.find( { user: req.user.id } ) ;

    if( !bookings.length )
        return next( new AppError( 'You haven\'t booked any tours yet! Please book a tour and come back. 🙂' , 404 ) ) ;
    
    // 2) Find tours with the returned IDs
    const tourIds = bookings.map( el => el.tour ) ;
    const tours = await Tour.find( { _id: { $in: tourIds } } ) ;


    // *With Virtual Populate* ; Inefficient as need to populate() all tour-fields via bookings. Although API would be used not largely BUT this endpoint could be.
    // const userWithBookings = await User.findById( req.user.id ).populate( {
    //     path: 'bookings',         // Virtual populate from User -> Bookings
    //     populate: {
    //         path: 'tour',           // Deep Nested populate: Booking -> Tour
    //         model: 'Tour'
    //     }
    // } ) ;
    // const userWithBookings = await User.findById( req.user.id ).populate( 'bookings' ).populate( 'bookings.tour' ) ;
    // const tours = userWithBookings.bookings.map( booking => booking.tour ) ;

    res.status( 200 ).render( 'overview' , {
        title: 'My Tours' ,
        tours
    } ) ;
} ) ;

// Normal HTTP POST request. This method is also hard for handling errors like wrong email would take to a new page.
// exports.updateUserData = catchAsync( async ( req , res , next ) => {
//     // console.log('Update data: ' , req.body ) ; // Use Middleware "app.use( express.urlencoded( { extended: true, limit: '10kb' } ) ) ; " to parse form-data sent to server by action="post" as application/x-www-form-urlencoded by default.

//     const updatedUser = await User.findByIdAndUpdate( req.user.id , {
//         name: req.body.name , // We can access these as we gave them the name-attribute in the form.
//         email: req.body.email
//     },
//     {
//         runValidators: true ,
//         new: true
//     } ) ;

//     updatedUser.role = 'user' ;
//     res.status( 200 ).render( 'account' , {
//         title: 'Your account' ,
//         user: updatedUser
//     } ) ;
// } ) ;