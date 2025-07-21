/* eslint-disable */
// Index.js is for getting data from client and then delegating it to other modules.

import '@babel/polyfill' ; //- To allow newer JS features in older browsers.
import { displayMap } from './mapbox';
import { login , logout } from './login' ;
import { signup } from './signup' ;
import { updateSettings } from './update_settings' ;
import { bookTour } from './stripe';
import { showAlert } from './alert' ;

//? Used data-attribute instead of AJAX request as its faster. An AJAX request is a way for a web page to communicate with a server in the background, without requiring a full page reload.

const mapEle = document.getElementById('map') ;
const loginForm = document.querySelector('.form-login') ;
const signupForm = document.querySelector('.form-signup') ;
const logoutBtn = document.querySelector('.nav__el--logout') ;
const userDataForm = document.querySelector('.form-user-data') ;
const userPasswordForm = document.querySelector('.form-user-password') ;
const bookBtn = document.getElementById('book-tour') ;
const alertMsg = document.body.dataset.alert ;


if( mapEle ) {
    const locations = JSON.parse( mapEle.dataset.locations ) ; // Single Hyphens are converted automatically by DOM to camelCase. Like "data-start-date" --> "dataset.startDate"
    const mapboxToken = mapEle.dataset.mapboxToken ;
    const mapboxStyle = mapEle.dataset.mapboxStyle ;
    
    displayMap( locations , mapboxToken , mapboxStyle ) ;
}

if( loginForm ) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault() ;
        const email = document.getElementById('email').value ;
        const password = document.getElementById('password').value ;
        login( email , password ) ;
    } ) ;
}

if( signupForm ) {
    signupForm.addEventListener( 'submit' , async e => {
        e.preventDefault() ;
        const btn = signupForm.querySelector('.btn') ;
        btn.textContent = 'Processing' ;
        btn.blur() ;
        btn.classList.remove('dots-disable') ;
        const name = document.getElementById('name').value ;
        const email = document.getElementById('email').value ;
        const password = document.getElementById('password').value ;
        const passwordConfirm = document.getElementById('password-confirm').value ;
        await signup( { name , email , password , passwordConfirm } ) ;
        btn.textContent = 'Sign up' ;
        btn.classList.add('dots-disable') ;
    } ) ;
}

if( logoutBtn )
    logoutBtn.addEventListener('click', logout ) ;

if( userDataForm ) {
    userDataForm.addEventListener( 'submit' , async e => {
        e.preventDefault() ;

        // Now for file, we create "FormData-obj" to instruct browser to send it as multipart/form-data.
        const form = new FormData() ;
        form.append( 'name' , document.getElementById('name').value ) ;
        form.append( 'email' , document.getElementById('email').value ) ;
        form.append( 'photo' , document.getElementById('photo').files[0] ) ;
        await updateSettings( form , 'data' ) ; // ? Used "await" before clearing fields for waiting as it will work without await also.
    } ) ;
}

if( userPasswordForm ) {
    
    userPasswordForm.addEventListener( 'submit' , async e => {
        e.preventDefault() ;
        const saveBtn = document.querySelector('.btn--save-password');
        saveBtn.blur() ;
        saveBtn.textContent = 'Updating password' ;
        saveBtn.classList.remove('dots-disable') ;

        const passwordCurrent = document.getElementById('password-current').value ;
        const password = document.getElementById('password').value ;
        const passwordConfirm = document.getElementById('password-confirm').value ;
        await updateSettings( { passwordCurrent , password , passwordConfirm } , 'password' ) ;
        
        saveBtn.textContent = 'Save Password' ;
        saveBtn.classList.add('dots-disable') ;
    } ) ;
    userPasswordForm.reset() ;  // Reset all form inputs to their default values for each load instead of using .value = '' 
}

if( bookBtn ) {
    bookBtn.addEventListener( 'click' , async e => {
        e.target.textContent = 'Processing' ;
        e.target.blur() ;
        e.target.classList.remove('dots-disable') ;
        const { tourId } = e.target.dataset ;

        // const { bookTour } = await import('./stripe') ; // OR can lazy-load the Stripe module on required page. As import() returns Promise so used await.
        await bookTour( tourId ) ;
        e.target.classList.add('dots-disable') ;
    } ) ;
}

if( alertMsg ) {
    showAlert( 'success' , alertMsg , 5000 ) ;
}