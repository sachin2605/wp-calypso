/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_FAIL,
	JETPACK_MODULE_ACTIVATE_SUCCESS
} from 'state/action-types';
import wp from 'lib/wp';

export const activateModule = ( module_slug ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_MODULE_ACTIVATE,
			module: module_slug
		} );
		return new Promise( ( resolve, reject ) => {
			wp.undocumented().activateJetpackModule( module_slug, ( error, data ) => {
				error ? reject( error ) : resolve( data );
			} );
		} ).then( () => {
			dispatch( {
				type: JETPACK_MODULE_ACTIVATE_SUCCESS,
				module: module_slug,
				success: true
			} );
		} ).catch( error => {
			dispatch( {
				type: JETPACK_MODULE_ACTIVATE_FAIL,
				module: module_slug,
				success: false,
				error: error.message || i18n.translate( 'There was a problem activating the module.' )
			} );
		} );
	};
};
