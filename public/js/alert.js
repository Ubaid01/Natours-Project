/* eslint-disable */

const hideAlert = () => {
    const ele = document.querySelector( '.alert' ) ;
    if( ele ) ele.remove() ;  // OR do like in course ele.parentElement.removeChild( ele ) ;
} ;

export const showAlert = ( type , msg , time = 2500 ) => {
    hideAlert() ;
    const markup = `<div class="alert alert--${ type }">${ msg }</div>`;
    document.querySelector( 'body' ).insertAdjacentHTML( 'afterbegin' , markup ) ; // 'afterbegin' means before the body-element's 1st child.
    window.setTimeout( hideAlert , time ) ;
} ;