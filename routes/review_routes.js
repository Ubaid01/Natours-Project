const express = require('express') ;
const reviewController = require('../controllers/review_controller') ;
const authController = require('../controllers/auth_controller') ;

const router = express.Router( { mergeParams: true } ) ; // ? It allows a child router to access route params defined in the mount path of the parent Like :tourId in tourRoutes where its mounted on "/:tourId/reviews".

router.use( authController.protect ) ;
router.route('/').get( reviewController.getAllReviews ).post( authController.restrictTo('user') , reviewController.setTourUserIds , reviewController.createReview ) ;

router.use( authController.restrictTo('user' , 'admin') ) ;
router.route('/:id').patch( reviewController.updateReview ).delete( reviewController.deleteReview ) ;
module.exports = router ;