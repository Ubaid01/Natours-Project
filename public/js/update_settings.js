/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alert";

export const updateSettings = async ( data , type ) => {
    try {
        const url = type === 'password' ? 'http://127.0.0.1:3000/api/v1/users/updatePassword' : 'http://127.0.0.1:3000/api/v1/users/updateMe' ;
        const res = await axios( url , {
            method: 'PATCH',
            data
        } ) ;

        if( res.data.status === 'success' ) {
            // type[0] = String.fromCharCode( type[0].charCodeAt(0) - 32 ) ; // ? JS-strings are immutable so can use .split('') to make char-array for modification then can use .join('') to make string again.OR use upperCase ON 0th and then slice(1)
            showAlert( 'success' , `${ type === 'password' ? 'Password' : 'Data' } updated successfully!` ) ;
            window.setTimeout( () => {
                location.assign('/me') ;
            } , 1500 ) ;
        }
    }
    catch( err ) {
        showAlert( 'error' , err.response.data.message ) ;
    }
} ;