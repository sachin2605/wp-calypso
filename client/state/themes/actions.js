/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	THEME_REQUEST,
	THEME_REQUEST_SUCCESS,
	THEME_REQUEST_FAILURE,
	THEMES_RECEIVE,
	THEMES_REQUEST,
	THEMES_REQUEST_SUCCESS,
	THEMES_REQUEST_FAILURE,
	THEME_ACTIVATE,
	THEME_ACTIVATE_SUCCESS,
	THEME_ACTIVATE_FAILURE,
	THEMES_RECEIVE_SERVER_ERROR,
} from 'state/action-types';
import {
	recordTracksEvent,
	withAnalytics
} from 'state/analytics/actions';
/**
 * Returns an action object to be used in signalling that a theme object has
 * been received.
 *
 * @param  {Object} theme Theme received
 * @return {Object}      Action object
 */
export function receiveTheme( theme ) {
	return receiveThemes( [ theme ] );
}

/**
 * Returns an action object to be used in signalling that theme objects have
 * been received.
 *
 * @param  {Array}  themes Themes received
 * @return {Object}       Action object
 */
export function receiveThemes( themes ) {
	return {
		type: THEMES_RECEIVE,
		themes
	};
}

/**
 * Triggers a network request to fetch themes for the specified site and query.
 *
 * @param  {?Number}  siteId    Site ID
 * @param  {Boolean}  isJetpack If the site is a Jetpack site
 * @param  {String}   query     Theme query
 * @return {Function}           Action thunk
 */
export function requestThemes( siteId, isJetpack = false, query = {} ) {
	return ( dispatch ) => {
		let siteIdToQuery, siteIdToStore, queryWithApiVersion;

		if ( isJetpack ) {
			siteIdToQuery = siteId;
			siteIdToStore = siteId;
			queryWithApiVersion = { ...query, apiVersion: '1' };
		} else {
			siteIdToQuery = null;
			siteIdToStore = 'wpcom'; // Themes for all wpcom sites go into 'wpcom' subtree
			queryWithApiVersion = { ...query, apiVersion: '1.2' };
		}

		dispatch( {
			type: THEMES_REQUEST,
			siteId: siteIdToStore,
			query
		} );

		return wpcom.undocumented().themes( siteIdToQuery, queryWithApiVersion ).then( ( { found, themes } ) => {
			dispatch( receiveThemes( themes ) );
			dispatch( {
				type: THEMES_REQUEST_SUCCESS,
				siteId: siteIdToStore,
				query,
				found,
				themes
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: THEMES_REQUEST_FAILURE,
				siteId: siteIdToStore,
				query,
				error
			} );
		} );
	};
}

/**
 * Triggers a network request to fetch a specific theme from a site.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   themeId Theme ID
 * @return {Function}        Action thunk
 */
export function requestTheme( siteId, themeId ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_REQUEST,
			siteId,
			themeId
		} );

		return wpcom.site( siteId ).theme( themeId ).get().then( ( theme ) => {
			dispatch( receiveTheme( theme ) );
			dispatch( {
				type: THEME_REQUEST_SUCCESS,
				siteId,
				themeId
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: THEME_REQUEST_FAILURE,
				siteId,
				themeId,
				error
			} );
		} );
	};
}

export function receiveServerError( error ) {
	return {
		type: THEMES_RECEIVE_SERVER_ERROR,
		error: error
	};
}

/**
 * Returns an action object to be used in signalling that a theme activation
 * has been triggered
 *
 * @param  {Number}  themeId Theme to be activated
 * @param  {Object}  siteId Site used for activation
 * @return {Object}  Action object
 */
export function themeActivation( themeId, siteId ) {
	return {
		type: THEME_ACTIVATE,
		themeId,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that a theme activation
 * has been successfull
 *
 * @param  {Number}  themeId Theme received
 * @param  {Number}  siteId Site used for activation
 * @return {Object}  Action object
 */
export function themeActivated( themeId, siteId ) {
	return {
		type: THEME_ACTIVATE_SUCCESS,
		themeId,
		siteId,
	};
}

/**
 * Returns an action object to be used in signalling that a theme activation
 * has failed
 *
 * @param  {Number}  themeId Theme received
 * @param  {Number}  siteId Site used for activation
 * @param  {Number}  error Error response from server
 * @return {Object}  Action object
 */
export function themeActivationFailed( themeId, siteId, error ) {
	return {
		type: THEME_ACTIVATE_FAILURE,
		themeId,
		siteId,
		error,
	};
}

const defaultTrackData = {
	theme: undefined,
	previous_theme: 0,
	source: 'unknown',
	purchased: false,
	search_term: null
};

export function activateTheme( themeId, siteId, trackThemesActivationData = defaultTrackData ) {
	return dispatch => {
		dispatch( themeActivation( themeId, siteId ) );

		wpcom.undocumented().activatedTheme( themeId, siteId )
			.then( () => {
				dispatch( themeActivationSuccess( themeId, siteId, trackThemesActivationData ) );
			} )
			.catch( error => {
				dispatch( themeActivationFailed( themeId, siteId, error ) );
			} );
	};
}

export function themeActivationSuccess( themeId, siteId, trackThemesActivationData ) {
	const action = themeActivated( themeId, siteId );
	const trackThemeActivation = recordTracksEvent(
		'calypso_themeshowcase_theme_activate',
		trackThemesActivationData
	);
	return withAnalytics( trackThemeActivation, action );
}
