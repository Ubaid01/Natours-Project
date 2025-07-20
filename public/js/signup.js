/* eslint-disable */

import axios from 'axios' ;
import { showAlert } from './alert' ;

export const signup = async ( data ) => {
    try {
        const response = await axios( {
            method: 'POST' ,
            url: '/api/v1/users/signup' ,
            data
        } ) ;

        if( response.data.status === 'success' ) {
            showAlert( 'success' , 'Account created successfully!' ) ;
            window.setTimeout( () => {
                location.assign( '/' ) ;
            } , 1500 ) ;
        }
    }
    catch( err ) {
        showAlert( 'error' , err.response.data.message ) ;
    }
} ;