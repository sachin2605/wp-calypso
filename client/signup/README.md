# Modular Signup Framework

Modular Signup is a Calypso framework for creating flows that turn logged-out users without an account into logged-in users.

A Flow consists of a set of steps, organized in a certain order.

A Step is a React component that collects data for flows.

## Creating a new flow

You can define a new flow from `/client/signup/config/flows.js`, by adding a new property to the `flows` object.

A flow is defined by two properties, `steps` and `destination`:

- `steps` is an array listing the steps in the flow, in the order they should be presented to users. You can see a list of available steps from `/client/signup/config/steps.js`.
- `destination` is a `string` or `function` that determines which page users should be redirected to once they complete the last step in the flow. If provided as a `function`, it is called with all of the dependencies provided in the signup flow, and the user is redirected to whatever it returns.

There are also two optional properties:
- `description` is a brief description of what the flow is for.
- `lastModified` is a date stamp for when the flow was last updated.

Example:
```javascript
account: { steps: [ 'site', 'user' ], destination: '/me/next?welcome' }
```

Once you've added the flow to `flows.js`, it'll be available for users at `/start/flow-name` where `flow-name` is the key of your flow in `flows`.

*Note:* flows must include at least one step that creates a user and is able to provide a bearer token. See the `providesToken` property in "Creating a new step".

## Creating a new step

Anyone can create steps that flow designers can use in their flows.

You can add a new step to Modular Signup from `/client/signup/config/steps.js`. A step is defined by three properties:

- `stepName` is the identifier used to reference a step in `/client/signup/config/flows.js`.
- (optional) `dependencies`, which specifiy which properties this step needs from other steps in the flow in order to be processed.
- (optional) `providesDependencies` is an array that lets the signup framework know what dependencies the step is expected to provide. If the step does not provide all of these, or if it provides more than it says, an error will be thrown.
- (optional) `delayApiRequestUntilComplete` is a boolean that, when true, causes the step's `apiRequestFunction` to be called only after the user has submitted every step in the signup flow. This is useful for steps that the user should be able to go back and change at any point in signup.

You will also need to define which React component implements your step, but in in `/client/signup/config/step-components.js`. Make sure to require the component as an internal dependency in `step-components.js`.

### Implementing a step

The React component for a step should be implemented in `/signup/steps/`, in its own directory.

Steps must use the `SignupActions` module, by requiring it as an internal dependency:

```javascript
var SignupActions = require( 'lib/signup/actions' )
```

`SignupActions` allows the Modular Framework to handle the data collected by a step. This means your step must include a UI element that allows users to move to the next step in the flow, and that the function handling this element must use the method `submitSignupStep` from `SignupActions`.

In addition to `submitSignupStep`, make sure to also call `this.props.goToNextStep()` like in the example below. This allows the Modular Framework to render the next step in the flow. You will probably need to call `event.preventDefault()` as well, to skip the native handler for forms.

Example:

```javascript
handleSubmit: function( event ) {
	event.preventDefault();

	SignupActions.submitSignupStep( {
		stepName: this.props.stepName
	} );

	this.props.goToNextStep();
}
```

`submitSignupStep` takes the following parameters:

- a `step` object with the following properties:
 - `stepName`, the name of the step you're submitting.
- (optional) `errors`, an array of errors that will be attached to the step. If provided, the status of the step will be set to `invalid` in the Progress Store.
- (optional) `providedDependencies`, an object describing the data added by the step to the Dependency Store. Use this only for data that does not come from API requests.
- (optional) `processingMessage`, a message that is displayed at the end of the flow while the user waits for the apiRequestFunction to process. For example, "Creating your account" or "Setting up your site", depending on what your step does.

Some background on `providedDependencies` and the Dependency Store: submitted steps are saved in the Progress Store, where they wait to have their dependencies met. For example, a step that creates a site needs to wait until a user account is created. Once that happens, the step is processed and its result is saved in the Dependency Store, so other steps can use it. You can read more about this [here](https://github.com/Automattic/wp-calypso/tree/master/client/lib/signup).

### apiRequestFunction

If your step requires certain data from other steps before it can submit to the API, you can configure its `apiRequestFunction` in `signup/config/steps.js`. This is a function that is called once the data the step requires is available.

```javascript
{
	stepName: 'theme-selection',
	dependencies: [ 'siteSlug' ],
	apiRequestFunction: function( callback, dependencies ) {
		wpcom.undocumented().someRequest( dependencies.siteSlug, function( errors, response ) {
			callback( errors, { userId: response.userId } );
		} );
	}
}
```

Note that here `apiRequestFunction` calls an API endpoint (`someRequest` in this example), from which they expect to get `userId`. If the API request is successful, `response.userId` is added to the Dependency Store via the callback. This is why you don't need to specify dependencies provided by API requests in `providedDependencies`.

`apiRequestFunction` also receives an object containing any dependencies listed in the `dependencies` property of the step in `/client/signup/config/steps.js`. In the example above, the account step had a `dependencies` property set to `[ 'siteSlug' ]` and received the site slug in the `dependencies` argument of `apiRequestFunction` once it was called.

The above example includes an inline function definition, but we should keep the `apiRequestFunction` values in `StepActions` (`signup/config/step-actions.js`) and include them like:

```js
apiRequestFunction: stepActions.createSite
```

## Hello World

The steps below guide you through creating a new flow and step:

1 - create a new directory in `/client/signup/steps` called `hello-world`.

2 - add an `index.jsx` file to this directory

3 - add a simple React component to `index.jsx`:

```javascript
var React = require( 'react' );

module.exports = React.createClass( {
	displayName: 'HelloWorld',

	render: function() {
		return <span>Hello world</span>;
	}
} );
```

4 - add the new step to `/client/signup/config/step-components.js`. Include the component:
```javascript
var helloWorldComponent = require( 'signup/steps/hello-world' );
```

... and then create a new property for it:

```javascript
'hello-world': helloWorldComponent // This is the component to show for this step
```

5 - add the new step to `/client/signup/config/steps.js`. Include the component:

```javascript
	'hello-world': {
		stepName: 'hello-world' // has to match the property name
	},
```

6 - add a new flow to `/client/signup/config/flow.js`:

```javascript
hello: { // This will be the slug for the flow, i.e.: wordpress.com/start/hello
	steps: [ 'hello-world', 'user' ], // These are the steps that the user will be shown
	destination: '/' // This is where the user will be taken once the flow is complete
}
```

7 - open https://calypso.localhost:3000/start/hello in an incognito window. You should see your new React component as the first step of the flow.

8 - now we need a way for users to move to the next step of the flow. Let's add a button and a form to the step's `render` method:

```javascript
render: function() {
	return (
		<form onSubmit={ this.handleSubmit }>
			<p>This is the step named { this.props.stepName }</p>
			<button className="button" type="submit">Get started</button>
		</form>
	);
}
```

Make sure to require `SignupActions`:
```javascript
var SignupActions = require( 'lib/signup/actions' );
```

... and to create a function to handle what happens when the form is submitted:

```javascript
handleSubmit: function( event ) {
	event.preventDefault();

	SignupActions.submitSignupStep( {
		stepName: this.props.stepName
	} );

	this.props.goToNextStep();
}
```

9 - open https://calypso.localhost:3000/start/hello in an incognito window. You should see your updated React component, and when you click the "Get started" button you should be taken to the next step.
