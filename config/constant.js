'use strict';

exports.LIMIT = 0;

/** PERMISSION **/
exports.PERMISSION_DENIED           = 'Permission denied';
exports.UNAUTHORIZED_REQUEST        = 'Unauthorized request';
exports.SERVER_ERROR                = 'Server error';
exports.DATABASE_CONN_ERROR         = 'Connection error';
exports.SERVICE_UNAVAILABLE         = 'Service unavailable';
exports.FORBIDDEN_REQUEST           = 'Forbidden request';
exports.SERVER_MAINTENANCE          = 'Maintenance: Server is undergoing service upgrade. Please return later';


/** USER */
exports.USER_SIGNIN_FAILED          = 'Invalid email and/or password';
exports.USER_SIGNIN_SUCCESS         = 'Signed in success';
exports.USER_SIGNED_OUT             = 'You have logged out';
exports.USER_CREATE_FAILED          = 'Could not create user';
exports.USER_CREATE_SUCCESS         = 'User created';

/** AIRLINE */
exports.AIRLINE_CREATE_FAILED       = 'Could not create airline information';
exports.AIRLINE_CREATE_SUCCESS      = 'Airline information created';
exports.AIRLINE_FETCH_FAILED        = 'Could not fetch airline information';
exports.AIRLINE_FETCH_SUCCESS       = 'Airline information fetched';