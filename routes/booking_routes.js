const express = require('express') ;
const authController = require('../controllers/auth_controller') ;
const bookingController = require('../controllers/booking_controller') ;

const router = express.Router() ;


router.use( authController.protect ) ;
router.get('/checkout-session/:tourId' , bookingController.getCheckoutSession ) ; // It also doesn't follow RESTful principle as its for checkout session and not for any booking.

router.use( authController.restrictTo('admin' , 'lead-guide') ) ;
router.route('/').get( bookingController.getAllBookings ).post( bookingController.createBooking ) ;
router.route('/:id').get( bookingController.getBooking ).patch( bookingController.updateBooking ).delete( bookingController.deleteBooking ) ;
module.exports = router ;