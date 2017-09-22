## Console React Apps Architecture

<br/>

### Directory structure
All React apps will be present in the global ``React`` folder. It further contains 2 more folders -
- ``Apps`` - Container for all individual react apps.
- ``Components`` - Container for all shared components (for usability across all react apps).

This folder also contains the ``webpack`` config and ``node_modules`` required by all of the react apps.

<br/>

### Build process

``NPM`` scripts have been created to leverage ``parallel-webpack`` (bundles your webpack scripts in parallel).

To build all the scripts, use - 
```javascript
npm run build
```

To run a watcher on all scripts, use - 
```javascript
npm run watch
```

<br/>

### Shared component fixes
Shared components that need to be fixed for reusability -

#### SelectBox

Issue - Sass not separated out for reusability.

#### CodeEditor

Issue - Component not generic enough. Plus code formatting can be improved.

<br/>

### Other fixes
- Naming conventions should be improved.
- Global build process can be improved.
- Shared components should have their styles intact, as part of the module bundling process, as oppsosed to a separate Sass build pipeline.




