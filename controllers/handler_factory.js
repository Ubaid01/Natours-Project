const catchAsync = require( '../utils/catch_async' ) ;
const AppError = require( '../utils/app_error' ) ;
const APIFeatures = require( '../utils/api_features' ) ;

// If arrow-functions curly braces ARE not used so then can avoid "wrapper-closure return" also.
exports.deleteOne = Model =>
    catchAsync ( async(req, res, next) => {
        const doc = await Model.findByIdAndDelete( req.params.id ) ;
        if( !doc )
            return next( new AppError( `No ${ Model.modelName.toLowerCase() } document found with given ID!` , 404 ) ) ;

        res.status(204).json( { 
            status: 'success',
            data: null
        } ) ;
    } ) ;

exports.updateOne = ( Model ) => {
    return catchAsync( async(req, res, next) => {
        const doc = await Model.findByIdAndUpdate( req.params.id , req.body , {
            new: true ,
            runValidators: true
        } ) ;
        
        const label = Model.modelName.toLowerCase() ;
        if( !doc )
            return next( new AppError( `No ${ label } doc found with given ID!` , 404 ) ) ;
    
        res.status(200).json( {
            status: 'success',
            data: {
                [ label ]: doc // Wrap label inside [] to use as dynamic-key.
            }
        } ) ;
    } ) ;
} ;

exports.createOne = ( Model ) => {
    return catchAsync( async( req , res , next ) => {
        // const newTour = await new Tour( req.body ) ;
        // newTour.save() ;

        const doc = await Model.create( req.body ) ;
        res.status( 201 ).json( {
            status: "success", 
            data: {
                [ Model.modelName.toLowerCase() ]: doc
            }
        } ) ;
    } ) ;
} ;

exports.getOne = ( Model, populateOptions ) => {
    return catchAsync( async( req , res , next ) => {
        let query = Model.findById( req.params.id ) ; // Similar to Tour.findOne( { _id: req.params.id } ) ; Search via ObjectId.
        if( populateOptions ) 
            query = query.populate( populateOptions ) ;

        const doc = await query ; // ? "await" in end to resolve NOT directly after find AS then we can't use chaining.
        const label = Model.modelName.toLowerCase() ;

        // If no tour found with correct objectId format passed so operational error. Like take any objId and change last digit.
        if( !doc )
            return next( new AppError( `No ${ label } doc found with given ID!` , 404 ) ) ; // ? Call return next(error) to pass to error handler directly AS its NOT a program error so catch() block will not run.
    
        res.status(200).json( {
            status: 'success' ,
            data: {
                [ label ]: doc
            }
        } ) ;
    } ) ;
} ;


exports.getAll = ( Model ) => {
    return catchAsync( async ( req , res , next ) => {

        // To allow for nested GET reviews on tour.
        let filter = {} ;
        if( req.params.tourId )
            filter = { tour: req.params.tourId } ;

        // console.log( req.query ) ; // To get query-strings like "/api/v1/tours?duration=5&difficulty=easy" ; Express will automatically convert & to ',' op.
        // "return this-object" each time so that new object can be chained.
        const features = new APIFeatures( Model.find( filter ) , req.query )
        .filter()
        .sort()
        .limitFields()
        .paginate() ; 

        // const docs = await features.query.explain() ;
        const docs = await features.query ;
        res.status( 200 ).json( {
            status: 'success',
            results: docs.length ,
            data: {
                [ Model.modelName.concat('s').toLowerCase() ]: docs
            }
        } ) ;
    } ) ; 
} ;