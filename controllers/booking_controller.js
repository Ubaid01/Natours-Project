const stripe = require('stripe')( process.env.STRIPE_SECRET_KEY ) ;
const Tour = require('../models/tour_model') ;
const User = require('../models/user_model') ;
const catchAsync = require('../utils/catch_async') ;
const Booking = require('../models/booking_model') ;
const factory = require('./handler_factory') ;

// Stripe works with the Session to charge the Credit-Card and so card-details NOT reach our server avoiding any security issues.
exports.getCheckoutSession = catchAsync( async ( req , res , next ) => {
    const tour = await Tour.findById( req.params.tourId ) ;

    const session = await stripe.checkout.sessions.create( {
        payment_method_types: ['card'] ,
        mode: 'payment', // Tells Stripe its a 1-time payment.

        // success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}` ,
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking` ,

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
                    images: [ `${req.protocol}://${req.get('host') }/img/tours/${tour.imageCover}`] // Our Deployed live image.
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

const createBookingCheckout = catchAsync( async session => {
    const tour = session.client_reference_id ;
    const user = ( await User.findOne( { email: session.customer_email } ) ).id ;
    const price = session.amount_total / 100 ;
    await Booking.create( { tour , user , price } ) ;
} ) ;

exports.webhookCheckout = async( req , res , next ) => {
    const signature = req.headers['stripe-signature'] ; 
    let event ;

    try {
        event = stripe.webhooks.constructEvent( req.body , signature , process.env.STRIPE_WEBHOOK_SECRET ) ; // RAW-form body for Stripe.
    }
    catch( err ) {
        return res.status( 400 ).send( `Webhook error: ${ err.message }` ) ;
    }
    
    if( event.type === 'checkout.session.completed' )
        await createBookingCheckout( event.data.object ) ;
    
    res.status( 200 ).json( { received: true } ) ; // For Webhook Dashboard Events.
} ;

exports.getAllBookings = factory.getAll( Booking ) ;
exports.getBooking = factory.getOne( Booking ) ;
exports.createBooking = factory.createOne( Booking ) ;
exports.deleteBooking = factory.deleteOne( Booking ) ;
exports.updateBooking = factory.updateOne( Booking ) ;