const multer = require('multer') ;
const path = require('path') ;
const sharp = require('sharp') ;
const Tour = require('../models/tour_model') ; // Find in parent directory of "models".
const catchAsync = require('../utils/catch_async') ;
const AppError = require('../utils/app_error') ;
const factory = require('./handler_factory') ;


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

// If we only needed 1 multiple field files so use "upload.array( 'images' , 5 )" with req.files NOT file.
exports.uploadTourImages = upload.fields( [
    { name: 'imageCover' , maxCount: 1 } ,
    { name: 'images' , maxCount: 3 }
] ) ;

const photoFilePath = path.join( process.cwd(), 'public/img/tours' ) ;
exports.resizeTourImages = catchAsync( async ( req , res , next ) => {
    // console.log( req.files ) ;
    if( !req.files.imageCover || !req.files.images )
        return next() ;

    req.body.imageCover = `tour-${ req.params.id }-${ Date.now() }-cover.jpeg` ;  // As via factory function, we will be taking whole req.body as input so attach there INSTEAD of doing via another middleware.

    // Used 3x2 ratio.
    await sharp( req.files.imageCover[0].buffer ).resize( 2000 , 1333 ).toFormat('jpeg').jpeg( { quality: 90 } )
        .toFile( path.join( photoFilePath , req.body.imageCover ) ) ;

    // ? Use map() + Promise.all() instead of forEach() because forEach doesn't support async/await properly as it can lead to unhandled promises and unexpected behavior.
    req.body.images = await Promise.all( 
            req.files.images.map( async ( file , i ) => {
            const filename = `tour-${ req.params.id }-${ Date.now() }-${ i + 1 }.jpeg` ;
            await sharp( file.buffer ).resize( 2000 , 1333 ).toFormat('jpeg').jpeg( { quality: 90 } )
                .toFile( path.join( photoFilePath , filename ) ) ;
            return filename ;
        } ) 
    ) ;

    next() ;
} ) ;

exports.aliasTopTours = ( req, res , next ) => {
    req.query.limit = '5' ;
    req.query.sort = '-ratingsAverage,price' ;
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty' ;
    next() ;
} ;

// 2) Route Handlers
exports.getAllTours = factory.getAll( Tour ) ;
exports.getTour = factory.getOne( Tour , { path: 'reviews' } ) ;
exports.createTour = factory.createOne( Tour ) ;
exports.updateTour = factory.updateOne( Tour ) ;
exports.deleteTour = factory.deleteOne( Tour ) ;

exports.getTourStats = catchAsync( async( req , res , next ) => {
    // Passed array of stages. MongoDB aggregation pipeline stages are executed in order. Using "await" will give the result of aggregate-object.
    const stats = await Tour.aggregate( [
        {
            $match: { ratingsAverage: { $gte: 4.5 } } // Filter docs. $group only processes the documents that are passed from $match.
        },
        {
            $group: { 
                // _id: null, // Group by null (everything).
                // _id: '$ratingsAverage' ,
                
                _id: { $toUpper: '$difficulty' } , // Group by "difficulty" field.
                numTours: { $sum: 1 } , // Add '1' for all aggregated-docs counter.
                numRatings: { $sum: '$ratingsQuantity' } ,
                avgRating: { $avg: '$ratingsAverage' } , // MongoDB Operator with name of field which needs to be aggregated. (using $ prefix).
                avgPrice: { $avg: '$price' } ,
                minPrice: { $min: '$price' } ,
                maxPrice: { $max: '$price' } 
            }
        },
        {
            $sort: { avgRating: 1 }
        }
        // {
        //     $match: { _id: { $ne: 'EASY' } } // Repeated "filter-stage" to exclude "EASY" from results.
        // }
    ] ) ;

    res.status(200).json( {
        status: 'success',
        data: {
            stats
        }
    } ) ;
} ) ;

exports.getMonthlyPlan = catchAsync ( async( req , res , next ) => {
    const year = parseInt( req.params.year , 10 ) ;
    const plan = await Tour.aggregate( [
        {
            $unwind: '$startDates' // Unwind/Deconstruct the array and create a document for each element. Like multiple-docs for all Dates of org-doc.
        },
        {
            $match: {
                startDates: {
                    $gte: new Date( `${year}-01-01` ) ,
                    $lte: new Date( `${year}-12-31` )
                }
            }
        },
        {
            $group: {
                // _id: { $month: '$startDates.getMonth()' } , // startDates is not defined so use MongoDB operator.
                _id: { $month: '$startDates' } ,
                numTourStarts: { $sum: 1 } ,
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            // '0' means exclude "_id" field from result.
            $project: {
                _id: 0,
            }
        },
        {
            $sort: { numTourStarts: -1 }
        },
        // {
        //     $limit: 12
        // }
    ] ) ;
    res.status(200).json( {
        status: 'success',
        data: {
            plan
        }
    } ) ;
} ) ;

exports.getToursWithin = catchAsync( async( req , res , next ) => {
    const { distance , latlong , unit } = req.params ;
    const [ lat , lon ] = latlong.split( ',' ) ;

    if( !lat || !lon )
        return next( new AppError( 'Please provide latitude and longitude in the format lat,lon' , 400 ) ) ;

    const radius = ( unit !== 'mi' ) ? distance / 6378.1 : distance / 3963.2 ; // For Radius ; use "Radian-angle-unit" so divide by radius of Earth.

    // $geoWithin op: Selects documents with geospatial data that exists entirely within a specified shape. It works on (lon, lat) NOT general (lan, lon) one.
    const tours = await Tour.find( {
        startLocation: { $geoWithin: { $centerSphere: [ [ lon , lat ] , radius ] } } // Find all tours whose startLocation is within the sphere (circle) centered at [lon, lat] with the given radius.
    } ) ;
    res.status(200).json( {
        status: 'success',
        results: tours.length ,
        data: {
            tours
        }
    } ) ;
} ) ;

exports.getDistances = catchAsync( async( req , res , next ) => {
    const { latlong , unit } = req.params ;
    const [ lat , lon ] = latlong.split( ',' ) ;

    if( !lat || !lon )
        return next( new AppError( 'Please provide latitude and longitude in the format lat,lon' , 400 ) ) ;

    // ? For GeoSpatial queries ; there is only 1-stage i.e. $geoNear stage AND it MUST always be the first stage.
    const multiplier = ( unit !== 'mi' ) ? 0.001 : 0.000621371 ; // Multiply here as dist calculated will be in meters.
    const distances = await Tour.aggregate( [
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [ parseFloat( lon ) , parseFloat( lat ) ]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1 ,
                name: 1
            }
        }
    ] ) ;

    res.status(200).json( {
        status: 'success',
        data: {
            distances
        }
    } ) ;
} ) ;