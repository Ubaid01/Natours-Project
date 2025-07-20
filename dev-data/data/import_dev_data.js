const dotenv = require('dotenv') ;
dotenv.config( { path: './config.env' } ) ;

const fs = require('fs') ;
const mongoose = require('mongoose') ;
const Tour = require('../../models/tour_model') ;
const User = require('../../models/user_model') ;
const Review = require('../../models/review_model') ;

const DB = process.env.DATABASE.replace( '<db_password>' , process.env.DATABASE_PASSWORD ) ;
mongoose.connect( DB , {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
} ).then( ( ) => {
    console.log('DB connection successful!') ;
} ) ;

const tours = JSON.parse( fs.readFileSync( `${__dirname}/tours.json` , 'utf-8' ) ) ;
const users = JSON.parse( fs.readFileSync( `${__dirname}/users.json` , 'utf-8' ) ) ;
const reviews = JSON.parse( fs.readFileSync( `${__dirname}/reviews.json` , 'utf-8' ) ) ;

const importData = async () => {
    try {
        await Tour.create( tours ) ; // Directly pass whole array.
        await User.create( users , { validateBeforeSave: false } ) ; // As we don't have passwordConfirm in json. Also remove the pre-save passHooks.
        await Review.create( reviews ) ;
        console.log('Data successfully loaded!') ;
    }
    catch ( err ) {
        console.log(`Data Import Error: ${err}` ) ;
    }
    process.exit() ;
}

const deleteData = async () => {
    try {
        await Tour.deleteMany() ; // Delete all docs.
        await User.deleteMany() ;
        await Review.deleteMany() ;
        console.log('Data successfully deleted!') ;
    }
    catch ( err ) {
        console.log(`Data Delete Error: ${err}` ) ;
    }
    process.exit() ; // Directly close the script.
}

// console.log( process.argv ) ;
if ( process.argv[2] === '--import' ) // Use "node .\dev-data\data\import_dev_data.js --import"
    importData() ;
else if ( process.argv[2] === '--delete' )
    deleteData() ;