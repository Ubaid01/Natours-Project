/* eslint-disable */

// Used stripe <script> in tour.pug for frontend.
import axios from 'axios' ;
import { showAlert } from './alert' ;
const stripe = Stripe('pk_test_51RmX9TPIbdLnGBtp1HiY3QJUydK3l40m5YxVH5evuoc67mOFdSBE2hUpghvHE8mrpi97EY2gXzMorEqRfafvEiyN00MaA86NpS') ;

// Stripe also send Emails automatically when use successfully purchases tour.
export const bookTour = async ( tourId ) => {
    try {
        // 1. Get checkout session from API
        const session = await axios( `/api/v1/bookings/checkout-session/${tourId}` ) ;

        // 2. Create checkout form + charge credit card ; For testing use '4242 4242 4242 4242'.
        await stripe.redirectToCheckout( {
            sessionId: session.data.session.id
        } ) ;
    }
    catch( err ) {
        console.log( err ) ;
        showAlert( 'error' , err ) ;
    }
} ;