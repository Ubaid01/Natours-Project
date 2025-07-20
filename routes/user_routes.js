const express = require('express') ;
const userController = require('../controllers/user_controller') ;
const authController = require('../controllers/auth_controller') ;

const router = express.Router() ;

router.route('/signup').post( authController.signup ) ; // 'signup' is a special-case action where users register themselves, so it's acceptable outside RESTful /users.
router.route('/login').post( authController.login ) ; // Login is POST request as we are sending credentials.
router.route('/logout').get( authController.logout ) ;
router.route('/forgetPassword').post( authController.forgetPassword ) ;
router.route('/resetPassword/:token').patch( authController.resetPassword ) ;

router.use( authController.protect ) ; // ? Since middleware runs in sequence so all below routes will be protected for logged-in user only.

router.route('/updatePassword').patch( authController.protect , authController.updatePassword ) ;
router.route('/me').get( userController.getMe , userController.getUser ) ;
router.route('/updateMe').patch( userController.uploadUserPhoto , userController.resizeUserPhoto , userController.updateMe ) ;
router.route('/deleteMe').delete( userController.deleteMe ) ;

// Only admin can access below routes.
router.use( authController.restrictTo('admin') ) ;
router.route('/').get( userController.getAllUsers ).post( userController.createUser ) ;
router.route('/:id').get( userController.getUser ).patch( userController.updateUser ).delete( userController.deleteUser ) ;

module.exports = router ;