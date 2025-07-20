/* eslint-disable */

import axios from 'axios' ;
import { showAlert } from './alert';
export const login = async ( email , password ) => {
    try {
        const res = await axios( {
            method: 'POST' ,
            url: '/api/v1/users/login' , // Since API and App are hosted on same server(served from same origin) so relative path will work fine.
            data: {
                email ,
                password
            }
        } ) ;

        if( res.data.status === 'success' ) {
            showAlert( 'success' , 'Logged in successfully!' ) ;
            window.setTimeout( () => {
                location.assign( '/' ) ;
            } , 1500 ) ;
        }
    }
    catch( err ) {
        showAlert( 'error' , err.response.data.message ) ;
    }
} ;

export const logout = async () => {
    try {
        const res = await axios( {
            method: 'GET' ,
            url: '/api/v1/users/logout'
        } ) ;
        if( res.data.status === 'success' )
            location.reload( true ) ; // ? Using "true" reloads the page from the server NOT from the cache.
    }
    catch( err ) {
        showAlert( 'error' , 'Error logging out! Try Again.' ) ; 
    }
} ;