const mongoose = require('mongoose') ;
const validator = require('validator') ;
const bcrypt = require('bcryptjs') ;
const crypto = require('crypto') ;

const userSchema = new mongoose.Schema( {
    name: {
        type: String,
        trim: true,
        required: [true, 'A user must have a name']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'A user must have an email'],
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        minlength: 8,
        select: false,
        required: [true, 'A user must have a password of atleast 8 characters']
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on SAVE() and CREATE(). Not directly on find() or update().
            validator: function( val ) {
                return val === this.password ;
            },
            message: 'Passwords do not match'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
} ) ;

userSchema.virtual('bookings' , {
    ref: 'Booking' ,
    foreignField: 'user' ,
    localField: '_id'
} ) ;

userSchema.pre( 'save' , async function( next ) {
    if( !this.isModified('password') )
        return next() ;

    this.password = await bcrypt.hash( this.password , 12 ) ;
    this.passwordConfirm = undefined ;
    next() ;
} ) ;

userSchema.pre( 'save' , function( next ) {
    if( !this.isModified("password") || this.isNew )
        return next() ;

    this.passwordChangedAt = Date.now() - 1000 ; // Subtract 1-sec to handle possible timing issues where the token might be created just before the document is saved.
    next() ;
} ) ;

userSchema.pre( 'find' , function( next ) {
    this.find( { active: { $ne: false } } ) ; // ? For "undefined" fields use { active: { $exists: false } }
    next() ;
} ) ;

// Instance methods.
userSchema.methods.correctPassword = async function( candidatePassword , userPassword ) {
    // console.log( this.password ) ;  // ? Since "this" refers to current-doc so if the doc on which function was called was passed with select('+password') then it will show password here also ELSE NOT due to select: false.
    return await bcrypt.compare( candidatePassword , userPassword ) ;
} ;

userSchema.methods.changedPasswordAfter = function( JWTTimestamp ) {
    if( !this.passwordChangedAt )
        return false ;
    
    const changedTimestamp = parseInt( this.passwordChangedAt.getTime() / 1000 , 10 ) ;
    return JWTTimestamp < changedTimestamp ;
} ;

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes( 32 ).toString('hex') ;
    this.passwordResetToken = crypto.createHash('sha256').update( resetToken ).digest('hex') ; // Store the hashed-token in DB not original directly.
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 ;
    return resetToken ; // Send unencrypted-token.
} ;

const User = mongoose.model( 'User', userSchema ) ;
module.exports = User ;
