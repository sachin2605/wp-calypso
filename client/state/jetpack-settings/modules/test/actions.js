/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	activateModule
} from '../actions';

import {
	JETPACK_MODULE_ACTIVATE_SUCCESS
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';
import wp from 'lib/wp';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#activateJetpackModule', () => {
		let sandbox;

		useSandbox( newSandbox => sandbox = newSandbox );

		it( 'should dispatch complete success when API activates a module', () => {
			sandbox.stub( wp, 'undocumented', () => ( {
				activateJetpackModule: ( module_slug, callback ) => callback( null, {} )
			} ) );

			const result = activateModule( 'module-a' )( spy );

			return result.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: JETPACK_MODULE_ACTIVATE_SUCCESS,
					module: 'module-a',
					success: true
				} );
			} );
		} );
	} );
} );
