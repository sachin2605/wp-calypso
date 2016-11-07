/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import assign from 'lodash/assign';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE,
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_FAIL,
	JETPACK_MODULE_ACTIVATE_SUCCESS
} from 'state/action-types';

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack modules data updates
 *
 * @param  {Array}  state  Current state
 * @param  {Object} action action
 * @return {Array}         Updated state
 */
export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case JETPACK_MODULE_ACTIVATE_SUCCESS:
			return assign( {}, state, {
				[ action.module ]: assign( {}, state[ action.module ], { activated: true } )
			} );
		// return initial state when serializing/deserializing
		case SERIALIZE:
		case DESERIALIZE:
			return {};
		default:
			return state;
	}
};

export const initialRequestsState = {
	activating: {},
};

/**
 * `Reducer` function which handles request/response actions
 * concerning Jetpack modules-related requests
 *
 * @param {Object} state - current state
 * @param {Object} action - action
 * @return {Object} updated state
 */
export const requests = ( state = initialRequestsState, action ) => {
	switch ( action.type ) {
		case JETPACK_MODULE_ACTIVATE:
			return assign( {}, state, {
				activating: assign( {}, state.activating, {
					[ action.module ]: true
				}
			) } );
		case JETPACK_MODULE_ACTIVATE_FAIL:
		case JETPACK_MODULE_ACTIVATE_SUCCESS:
			return assign( {}, state, {
				activating: assign( {}, state.activating, {
					[ action.module ]: false
				}
			) } );
		// return initial state when serializing/deserializing
		case SERIALIZE:
		case DESERIALIZE:
			return initialRequestsState;
		default:
			return state;
	}
};

export const reducer = combineReducers( {
	items,
	requests
} );
