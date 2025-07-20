const Tour = require('../models/tour_model') ;

class APIFeatures {
    constructor( query , queryString ) {
        this.query = query ; // Passed "query-object" also so that its not bounded to "Tours" only.
        this.queryString = queryString ;
    }

    filter() {
        const queryObj = { ...this.queryString } ;
        const excludedFields = [ 'page' , 'sort' , 'limit' , 'fields' ] ; 
        excludedFields.forEach( el => delete queryObj[ el ] ) ;

        // 1b) Advanced Filtering
        // { difficulty: 'easy', duration: { $gte: 5 } } --> "?duration[gte]=5&difficulty=easy"
        let queryStr = JSON.stringify( queryObj ) ;
        queryStr = queryStr.replace( /\b(gte|lte|gt|lt)\b/g , match => `$${match}` ) ; // '\b' to match exact word AND 'g' "global-flag" for all operators else it will do for 1st operator only.

        this.query = this.query.find( JSON.parse( queryStr ) ) ;
        return this ;
    }

    sort() {
        if( this.queryString.sort ) {
            const sortBy = this.queryString.sort.split(',').join(' ') ; // As for Mongoose ; sort is done like "query.sort("price ratings").
            this.query = this.query.sort( sortBy ) ; // For Descending order use '-' sign.
        }
        else
            this.query = this.query.sort( '-createdAt' ) ;
    
        return this ;
    }

    limitFields() {
        // 3) Projection
        if( this.queryString.fields ) {
            const fields = this.queryString.fields.split(',').join(' ') ;
            this.query = this.query.select( fields ) ;
        }
        else
            this.query = this.query.select( '-__v' ) ; // To hide fields using '-' while querying.

        return this ;
    }

    paginate() {
        // "skip-value" means "no.of docs to skip" then show the remaining limit-docs only.
        // query = query.skip(2).limit(5) ;
        
        const page = parseInt( this.queryString.page , 10 ) || 1 ;
        const limit = this.queryString.limit * 1 || 100 ;
        const skip = ( page - 1 ) * limit ;
        this.query = this.query.skip( skip ).limit( limit ) ; // Removed no Page result as that would be handled afterwards.
        return this ;
    }
} ;

exports.getAllTours = async ( req , res ) => {
    try {
        // console.log( req.query ) ; // To get query-strings like "/api/v1/tours?duration=5&difficulty=easy"

        // "return this-object" each time so that new object can be chained.
        const features = new APIFeatures( Tour.find() , req.query )
            .filter()
            .sort()
            .limitFields()
            .paginate() ; 
        
        // await features.paginate() ; // If Error thrown.
        const tours = await features.query ;
        res.status( 200 ).json( {
            status: 'success',
            results: tours.length ,
            data: {
                tours
            }
        } ) ;
    }
    catch( err ) {
        res.status( 400 ).json( {
            status: 'fail',
            message: `Unable to get details due to ${err.message}`
        } ) ;
    }
} ; 

module.exports = APIFeatures ;