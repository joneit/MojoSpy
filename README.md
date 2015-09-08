# bool-rle
Run-length-encoded booleans


### Re-purposing this build template

_Openfin developers:_
If you want to use this build template _for a new repo_
and make use of the symbolic link to the shared jsdoc
template, issue the following commands after pulling:

```javascript
$ rm -drf jsdoc-template/
$ rm .gitmodules
$ git submodule add https://github.com/openfin/jsdoc-template jsdoc-template
 ```
 
 These changes will then need to be committed.
 
