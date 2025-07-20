const stripe = require('stripe')( process.env.STRIPE_SECRET_KEY ) ;
const Tour = require('../models/tour_model') ;
const catchAsync = require('../utils/catch_async') ;
const Booking = require('../models/booking_model') ;
const factory = require('./handler_factory') ;

// Stripe works with the Session to charge the Credit-Card and so card-details NOT reach our server avoiding any security issues.
exports.getCheckoutSession = catchAsync( async ( req , res , next ) => {
    const tour = await Tour.findById( req.params.tourId ) ;

    const session = await stripe.checkout.sessions.create( {
        payment_method_types: ['card'] ,
        mode: 'payment', // Tells Stripe its a 1-time payment. ( Error in new API without it )

        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}` , // Stripe will make GET-request to this URL. Its just a workaround ; in real-world after successful payment we will get session-object via Stripe-Webhooks for new booking. WHY its not safe ; AS anyone knowing this URL can make a booking without checkout.

        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}` ,
        customer_email: req.user.email , // If this email doesn’t already have a Stripe Customer, Stripe will create one automatically.
        client_reference_id: req.params.tourId , // Custom field to link the session to a specific tour for backend processing
        // For Checkout page and Dashboard.
        line_items: [
        {
            price_data: {
                currency: 'usd',
                unit_amount: tour.price * 100, // Amount in cents
                product_data: {
                    name: `${tour.name} Tour`,
                    description: tour.summary,
                    images: [`https://natours.dev/img/tours/${tour.imageCover}`]
                }
            },
            quantity: 1
        }
        ]
    } ) ;

    res.status( 200 ).json( {
        status: 'success' ,
        session
    } ) ;
} ) ;

exports.createBookingCheckout = catchAsync( async ( req , res , next ) => {
    // This is ONLY TEMPORARY , b/c it's UNSECURE as anyone can make booking without paying.
    const { tour , user , price } = req.query ;
    if( !tour || !user || !price )
        return next() ;

    await Booking.create( { tour , user , price } ) ;
    res.redirect( req.originalUrl.split('?')[0] ) ; // Redirect to overview-homepage route i.e. removing query-strings.
} ) ;

exports.getAllBookings = factory.getAll( Booking ) ;
exports.getBooking = factory.getOne( Booking ) ;
exports.createBooking = factory.createOne( Booking ) ;
exports.deleteBooking = factory.deleteOne( Booking ) ;
exports.updateBooking = factory.updateOne( Booking ) ;