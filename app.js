const express = require('express') ;
const morgan = require('morgan') ;
const path = require('path') ;
const rateLimit = require('express-rate-limit') ;
const helmet = require('helmet') ;
const mongoSanitize = require('express-mongo-sanitize') ;
const xss = require('xss-clean') ;
const hpp = require('hpp') ;
const cookieParser = require('cookie-parser') ;
const compression = require('compression') ;
const cors = require('cors') ;

const AppError = require('./utils/app_error') ;
const globalErrorHandler = require('./controllers/error_controller') ;
const tourRouter = require('./routes/tour_routes') ;
const userRouter = require('./routes/user_routes') ;
const reviewRouter = require('./routes/review_routes') ;
const viewRouter = require('./routes/view_routes') ;
const bookingRouter = require('./routes/booking_routes') ;
const bookingController = require('./controllers/booking_controller') ;
const app = express() ;

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
// app.use( helmet() ) ; // ? Its best to put this early in the middleware stack.
// app.use( helmet( { contentSecurityPolicy: false } ) ) ;
// Only allow external trusted services to avoid XSS/cross-site-scripting attacks NOT to all.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'", 'https:'],
        scriptSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://cdnjs.cloudflare.com',
          'https://js.stripe.com', 
          "'unsafe-inline'"
        ],
        styleSrc: [
          "'self'",
          'https://api.mapbox.com',
          'https://fonts.googleapis.com',
          "'unsafe-inline'" // Required for Mapbox and some fonts (Not ideal for security)
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: [
          "'self'",
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://natours-project-u1.vercel.app',

          // Added this to allow Parcel HMR websocket:
          ...( process.env.NODE_ENV === 'development' ? ['ws://127.0.0.1:*', 'ws://localhost:*'] : ['wss://natours-project-u1.vercel.app:*'] )
        ],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://*.mapbox.com'],
        workerSrc: ["'self'", 'blob:'],
        objectSrc: ["'none'"]
      }
    }
  })
);

app.set('view engine' , 'pug' ) ;
app.set('views' , path.join(__dirname , 'views') ) ;

app.use( cors() ) ;
app.options( '*' , cors() ) ;

app.use( '/webhook-checkout' , express.raw( { type: 'application/json' } ) , bookingController.webhookCheckout ) ; // When we receive the body from Stripe ; the stripe function we used then will need the body in RAW format as STREAM not json. THAT's why we used this before express.json() middleware.

// Body parser
app.use( express.json( { limit: '10kb' } ) ) ;
app.use( express.urlencoded( { extended: true, limit: '10kb' } ) ) ;
app.use( cookieParser() ) ;
app.use( compression() ) ;

// Data sanitization against NoSQL query injection. Can only do this after reading data from req.body.
app.use( mongoSanitize() ) ;

// Data sanitization against XSS.
app.use( xss() ) ; 

// Prevent parameter pollution.
app.use( hpp( {
    whitelist: [ 'duration' , 'ratingsQuantity' , 'ratingsAverage' , 'maxGroupSize' , 'difficulty' , 'price' ] // We allow duplicates for these fields only.
} ) ) ;

// Serving static files
app.use( express.static( path.join(__dirname , 'public' ) ) ) ;

// Development logging
if( process.env.NODE_ENV === 'development' )
    app.use( morgan( 'dev' ) ) ;

// Limit requests from same API to avoid DOS-attack
const limiter = rateLimit( {
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again in an hour!'
    }
} ) ;
app.use( '/api' , limiter ) ; 

// 3) Routes
app.use( '/' , viewRouter ) ;
app.use( '/api/v1/tours' , tourRouter ) ; 
app.use( '/api/v1/users' , userRouter ) ;
app.use( '/api/v1/reviews' , reviewRouter ) ;
app.use( '/api/v1/bookings' , bookingRouter ) ;


app.all( '*' , ( req , res , next ) => {
    next( new AppError( `Route ${req.url} not found!` , 404 ) ) ;
} ) ;

app.use( globalErrorHandler ) ;
module.exports = app ;