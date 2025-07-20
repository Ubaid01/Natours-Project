const multer = require('multer') ;
const path = require('path') ;
const sharp = require('sharp') ;
const User = require('../models/user_model') ;
const catchAsync = require('../utils/catch_async') ;
const AppError = require('../utils/app_error') ;
const factory = require('./handler_factory') ;

const photoFilePath = path.join( process.cwd(), 'public/img/users' ) ;

// const multerStorage = multer.diskStorage( {
//     // Here cb() is similar to next() in Express.
//     // ? Use the root directory of your Node.js project. Also if we have not used options so Multer will store files in memory as Buffer using its default storage engine, which is memoryStorage.
//     destination: ( req , file , cb ) => {
//         cb( null , photoFilePath ) ;
//     } ,
//     filename: ( req , file , cb ) => {
//         const ext = file.mimetype.split( '/' )[ 1 ] ; // mimetype is like "image/jpeg" OR "application/pdf". It's how the browser or client declares what kind of file is being uploaded. OR can use path.extname() also BUT mimetype is more reliable.

//         cb( null , `user-${ req.user.id }-${ Date.now() }.${ ext }` ) ; // ? Give unique filename NOT of the originalFile as if 2 users upload diff-files with same name then they 2nd will overwrite 1st. Also using "id" it will be easy to find which user uploaded which file.
//     }
// } ) ;

const multerStorage = multer.memoryStorage() ;

const multerFilter = ( req , file , cb ) => {
    if( file.mimetype.startsWith( 'image' ) )
        cb( null , true ) ;
    else
        cb( new AppError( 'Not an image! Please upload only images.' , 400 ) , false ) ;
} ;

const upload = multer( {
    storage: multerStorage ,
    fileFilter: multerFilter
} ) ; 

const filterObj = ( obj , ...fields ) => {
    const newObj = {} ;
    Object.keys( obj ).forEach( el => {
        if( fields.includes( el ) )
            newObj[ el ] = obj[ el ] ;
    } ) ;
    return newObj ;
} ;

exports.uploadUserPhoto = upload.single( 'photo' ) ;  // field-name of form-data uploading image using "enctype="multipart/form-data".

// For doing image processing its best to store file in memory AND not in disk as need to read again for processing.
exports.resizeUserPhoto = catchAsync( async ( req , res , next ) => {
    if( !req.file )
        return next() ;

    req.file.filename = `user-${ req.user.id }-${ Date.now() }.jpeg` ; // We need this to save in DB so define now.
    await sharp( req.file.buffer ).resize( 500 , 500 ).toFormat('jpeg').jpeg( { quality: 90 } )
        .toFile( path.join( photoFilePath , req.file.filename ) ) ;
    next() ;
} ) ;

exports.updateMe = catchAsync( async ( req , res , next ) => {
    // console.log( req.file ) ; // Use "form-data" for this as req.body can't parse that.
    if( req.body.password || req.body.passwordConfirm ) // Error if user tries to update password.
    return next( new AppError( 'This route is not for password updates. Please use /updateMyPassword.' , 400 ) ) ;
    
    const filteredBody = filterObj( req.body , 'name' , 'email' ) ;
    if( req.file )
        filteredBody.photo = req.file.filename ;

    const updatedUser = await User.findByIdAndUpdate( req.user.id , filteredBody , {
        new: true ,
        runValidators: true, // ? Run schema validators on the updated fields only NOT on whole schema OR for "required" fields.
    } ) ;
    res.status( 200 ).json( {
        status: 'success' ,
        data: {
            user: updatedUser
        }
    } ) ;
} ) ;

exports.getMe = ( req , res , next ) => {
    req.params.id = req.user.id ;
    next() ;    
} ;

exports.deleteMe = catchAsync( async ( req , res , next ) => {
    await User.findByIdAndUpdate( req.user.id , { active: false } ) ;
    res.status( 204 ).json( {
        status: 'success'
    } ) ;    
} ) ;

exports.createUser = ( req , res ) => {
    res.status(500).json( {
        status: 'error' ,
        message: 'This route is not defined! Please use /signup instead.'
    } ) ;
} ;

exports.getAllUsers = factory.getAll( User ) ;
exports.getUser = factory.getOne( User ) ;

// Do NOT update passwords with this!
exports.updateUser = factory.updateOne( User ) ;
exports.deleteUser = factory.deleteOne( User ) ;