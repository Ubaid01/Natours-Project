const express = require('express') ;
const tourController = require('../controllers/tour_controller') ;
const authController = require('../controllers/auth_controller') ;
const reviewRouter = require('./review_routes') ;

const router = express.Router() ;
// router.param( 'id' , tourController.checkID ) ;

// Nested Routes due to relation b/w resources. Format: "/parentResource/:parentId/childResource". Also now this will mount on all routes defined on reviewRouter if they are configured.
router.use( '/:tourId/reviews' , reviewRouter ) ;


router.route('/tour-stats').get( tourController.getTourStats ) ;
router.route('/monthly-plan/:year').get( authController.protect , authController.restrictTo('admin' , 'lead-guide' , 'guide') , tourController.getMonthlyPlan ) ;
router.route('/top-5-cheap').get( tourController.aliasTopTours , tourController.getAllTours ) ; // Must define "Alias routes" like '/top-5-cheap' before dynamic-routes '/:id'.

// It can be done by query string also, but using URL parameters is more expressive and RESTful.
router.route('/tours-within/:distance/center/:latlong/unit/:unit').get( tourController.getToursWithin ) ;
router.route('/distances/:latlong/unit/:unit').get( tourController.getDistances ) ;

router.route('/').get( tourController.getAllTours ).post( authController.protect , authController.restrictTo('admin' , 'lead-guide') , tourController.createTour ) ;
router.route('/:id').get( tourController.getTour ).patch( authController.protect , authController.restrictTo('admin' , 'lead-guide') , tourController.uploadTourImages , tourController.resizeTourImages , tourController.updateTour ).delete( authController.protect , authController.restrictTo('admin' , 'lead-guide') , tourController.deleteTour ) ; 

module.exports = router ;