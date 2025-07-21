const express = require('express') ;
const viewController = require('../controllers/view_controller') ;
const authController = require('../controllers/auth_controller') ;
const router = express.Router() ;

router.use( viewController.alerts ) ;
// In views all will be GET-requests.
router.get('/' , authController.isLoggedIn , viewController.getOverview ) ;
router.get('/login' , viewController.getLoginForm ) ;
router.get('/signup', viewController.getSignupForm ) ;
router.get('/tour/:slug' , authController.isLoggedIn , viewController.getTour ) ;
router.get('/me' , authController.protect , viewController.getAccount ) ;
router.get('/my-tours' , authController.protect , viewController.getMyTours ) ;

module.exports = router ;