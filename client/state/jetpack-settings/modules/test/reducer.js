/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_FAIL,
	JETPACK_MODULE_ACTIVATE_SUCCESS
} from 'state/action-types';
import {
	items as itemsReducer,
	requests as requestsReducer,
	initialRequestsState
} from '../reducer';

import {
	modules,
	requests
} from './fixture';

describe( 'items reducer', () => {
	it( 'state should default to empty object', () => {
		const state = itemsReducer( undefined, {} );
		expect( state ).to.eql( {} );
	} );

	describe( '#modulesActivation', () => {
		it( 'should activate a module', () => {
			const stateIn = modules;
			const action = {
				type: JETPACK_MODULE_ACTIVATE_SUCCESS,
				module: 'module-a'
			};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ 'module-a' ].activated ).to.be.true;
		} );
	} );
} );

describe( 'requests reducer', () => {
	it( 'state should default to initialState', () => {
		const state = requestsReducer( undefined, {} );
		expect( state ).to.equal( initialRequestsState );
	} );

	describe( '#modulesActivation', () => {
		it( 'should set activating[ module_slug ] to true when activating a module', () => {
			const stateIn = requests;
			const action = {
				type: JETPACK_MODULE_ACTIVATE,
				module: 'module_slug'
			};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut.activating[ action.module ] ).to.be.true;
		} );

		it( 'should set activating[ module_slug ] to false when module has been activated', () => {
			const stateIn = requests;
			const action = {
				type: JETPACK_MODULE_ACTIVATE_SUCCESS,
				module: 'module_slug'
			};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut.activating[ action.module ] ).to.be.false;
		} );

		it( 'should set activating[ module_slug ] to false when activating a module fails', () => {
			const stateIn = requests;
			const action = {
				type: JETPACK_MODULE_ACTIVATE_FAIL,
				module: 'module_slug'
			};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut.activating[ action.module ] ).to.be.false;
		} );
	} );
} );
