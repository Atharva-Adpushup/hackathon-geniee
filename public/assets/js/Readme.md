## Editor's React workflow

We have used react.js to define our editor's UI. To define the react components we have JSX which compiles to regular Javascript using a grunt task defined in `Gruntfile.js`. With addition of `browserify`, we can also use require in react components. The compilation process begins from `Main.jsx` and results is `editor/componentCollection.js`.

## Setting up Grunt

- Install Node and NPM.
- Install NPM packages ( grunt-cli, browserify ) with global option (-g) like `npm install -g grunt-cli`
- Install NPM packages using `package.json`. Run npm install in the current directory.

Now the compilation process can be carried out by running `grunt` in current directory. To avoid running grunt again and again, use `grunt watch` which will carry out the compilation process automatically when files in `react_components/*` are changed.