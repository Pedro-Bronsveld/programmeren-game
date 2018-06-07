var copy = require('recursive-copy');

function moduleCopy(moduleName){
    copy('node_modules/' + moduleName, 'docs/libs/' + moduleName, function(error, results) {
        if (error) {
            console.error('Copy failed: ' + error);
        } else {
            console.info('Copied ' + results.length + ' files');
        }
    });
}
 
//copy three.js
moduleCopy("three");

//copy reqwest
moduleCopy("reqwest");