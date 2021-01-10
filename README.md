# Angular Micro-Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.6.

This is simply an example and proof of concept of using a micro-frontend
architecture with Angular. This project consists of a primary Angular
application, often referred to as a "UI Shell", as well as 3 sub-projects which
are each full blown Angular applications as well, only they are built and served
as custom elements by utilizing
[Angular Elements](https://angular.io/guide/elements).

In this case, our UI Shell is an Angular application, but it could just as
easily be written in React, Vue.js, or any other framework you'd like (or none
at all). We serve up the custom element's styles and JavaScript bundles directly
from the UI Shell's assets folder, but in a real world application these would
likely be deployed somewhere such as Amazon's S3 and delivered using CloudFront.

## Running the Application

If you'd like to run the application and see the working prototype for yourself, it's very easy:

```shell
git clone https://github.com/jtneal/angular-micro-frontend.git
cd angular-micro-frontend
npm install
npm run build:elements
npm start
```

At this point, you should be able to visit
[http://localhost:4200](http://localhost:4200)
and see something that looks like this:

![Screenshot of running application](/example.png?raw=true)

Voilà! See? Micro-frontend architectures aren't _THAT_ complicated.

## Development

If you want to work on a single custom element, you can run it just like you
would run any normal Angular application with ng serve:

```shell
npm run start -- --project example-one
```

This will give you all the features such as auto-build and auto-reload.

If you want to make changes and see them reflected in the UI Shell, you just
have to rebuild the custom elements:

```shell
npm run build:elements
```

## Caveats

The custom elements within this type of an architecture can be as big or as
small as you want them to be, there really are no limitations. Thanks to
Angular's Ivy rendering engine, the bundle sizes remain super small even within
rather complex applications. I've been playing with Angular Elements since
Angular 8, and actually using it in an enterprise environment across multiple
development teams since Angular 9. It has enabled our teams to work more
autonomously and independently. In our environment, each custom element has its
own CI/CD pipeline that deploys its bundles to Amazon S3. With the integration
happening at runtime, our UI Shell automatically updates without us having to
deploy it alongside the custom elements. There are, however, some concerns that
you should be aware of should you choose to explore a micro-frontend
architecture using these patterns.

### Routing

Each of our custom elements assumes they are just a normal Angular application.
We setup our routing into directory-like structures such that /example-one would
be the domain of example-one, and /example-two would be the domain of
example-two, so on and so forth. However, this can cause issues when routing
from one custom element to another. It can break native browser history and
things like the back button. There are solutions for this issue, but I feel it
lies a bit outside of the scope of a simple POC.

### UI Shell

Currently, to add new custom elements you would have to update the UI Shell in
order to pull in the bundles, reference the elements, setup the routing, etc.
Some people want to take micro-frontend to the next level and automate
everything. The common pattern I've seen to accomplish such a task is using
[Web app manifests](https://developer.mozilla.org/en-US/docs/Web/Manifest).
The manifest can reference the bundle locations and other details to enable
automatically updating the UI Shell. To me, this adds a layer of complexity that
simply isn't worth the trouble, so I don't bother with it. However, everyone's
use-cases and requirements are different, so it might be worth it to you.

### Initial Load Time

While our bundle sizes are fairly small, they will certaintly grow alongside
size and complexity. Additionally, the more custom elements you add, the more
bundles you are downloading on initial load. If this becomes a concern for you,
there are potential solutions. Angular natively supports
[lazy-loading](https://angular.io/guide/lazy-loading-ngmodules).
You can utilize this feature even with custom elements! Simply setup a module
for each of your custom elements, and have the bundles load in dynamically
within each of those modules rather than being hard coded in the index.html
file. This will require some DOM manipulation, so I don't love it, but it works.

## How this Project was Created

Seeing a finished working product is nice, but knowing how it got to that point
can be difficult. I like to maintain a step-by-step set of instructions for
projects like this to help you gain visibility into how everything was created.
Plus, if you want to explore a micro-frontend architecture for your projects,
knowing how everything works will be super important.

Everything starts in the shell:

```shell
ng new --routing --style scss angular-micro-frontend
cd angular-micro-frontend
ng g application --routing --style scss example-one
ng g application --routing --style scss example-two
ng g application --routing --style scss example-three
ng add @angular/elements
ng add ngx-build-plus --project example-one
ng add ngx-build-plus --project example-two
ng add ngx-build-plus --project example-three
npm install --save-dev npm-run-all
npm install --save-dev cpy-cli
```

If you're curious, ngx-build-plus just helps us build our custom elements into a
single bundle (main.js). Also, npm-run-all helps speed up some of our npm
scripts by allowing us to run them in parallel and cpy-cli is just to copy the
bundles from the dist folder and into the UI Shell's assets folder.

Next, update package.json to add all of our npm scripts to make life easier:

```json
"build:element": "npm run build -- --prod --output-hashing none --single-bundle true",
"build:element:example-one": "npm run build:element -- --project example-one",
"build:element:example-two": "npm run build:element -- --project example-two",
"build:element:example-three": "npm run build:element -- --project example-three",
"build:elements": "npm-run-all --parallel build:element:** --sequential build:elements:copy",
"build:elements:copy": "run-p build:elements:copy:js build:elements:copy:css",
"build:elements:copy:js": "cpy \"**/*.js\" \"!angular-micro-frontend/*.js\" \"../src/assets\" --cwd=dist --parents",
"build:elements:copy:css": "cpy \"**/styles.css\" \"!angular-micro-frontend/styles.css\" \"../src/assets\" --cwd=dist --parents",
```

### Make the following changes to each custom element project

Update the bootstrap in app.module.ts to:

```typescript
bootstrap: environment.production ? [] : [AppComponent]
```

Update the AppModule in app.module.ts to:

```typescript
export class AppModule implements DoBootstrap {
  public constructor(private readonly injector: Injector) { }

  public ngDoBootstrap(): void {
    const el = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('example-one', el);
  }
}
```

Be sure to change "example-one" to whatever custom element name you want to use.

Update app.component.html just to show the highlight board:

```html
Remove <!-- Toolbar --> block
Remove <!-- Resources --> block
Remove <!-- Next Steps --> block
Remove <!-- Terminal --> block
Remove <!-- Links --> block
Remove <!-- Footer --> block
Remove clouds svg
```

### Make the following changes only in the primary application (UI Shell)

Update your index.html to bring in the styles and JS:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Angular Micro-Frontend</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="stylesheet" href="/assets/example-one/styles.css">
  <link rel="stylesheet" href="/assets/example-two/styles.css">
  <link rel="stylesheet" href="/assets/example-three/styles.css">
</head>
<body>
  <app-root></app-root>
  <script src="/assets/example-one/polyfills.js" defer></script>
  <script src="/assets/example-one/main.js" defer></script>
  <script src="/assets/example-two/polyfills.js" defer></script>
  <script src="/assets/example-two/main.js" defer></script>
  <script src="/assets/example-three/polyfills.js" defer></script>
  <script src="/assets/example-three/main.js" defer></script>
</body>
</html>
```

Please note that it is entirely possible to only include one of these polyfills.
However, including all of them won't break anything, it's just a bit of a waste.
I recommend only including one and just making sure if you ever need to update
polyfills, you do so within all the custom elements to keep them aligned.

Update app.component.html and remove a few of the unnecessary blocks of code:

```html
Remove <!-- Resources --> block
Remove <!-- Next Steps --> block
Remove <!-- Terminal --> block
Remove <!-- Links --> block
Remove <!-- Footer --> block
```

In place of the removed blocks, add your new custom elements:

```html
<example-one></example-one>
<example-two></example-two>
<example-three></example-three>
```

Lastly, update your app.module.ts to let it know you're using custom elements:

```typescript
schemas: [CUSTOM_ELEMENTS_SCHEMA],
```
