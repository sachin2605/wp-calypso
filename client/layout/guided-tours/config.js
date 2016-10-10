/**
 * Internal dependencies
 */
import { combineTours } from 'layout/guided-tours/config-elements';
import { MainTour } from 'layout/guided-tours/main-tour';
import { SiteTitleTour } from 'layout/guided-tours/site-title-tour';

export default combineTours( {
	main: MainTour,
	siteTitle: SiteTitleTour,
} );
