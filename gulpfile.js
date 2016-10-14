var gulp = require('gulp');
var spawn = require('child_process').spawn,
    node;


gulp.task('server', function() {
    if (node) node.kill()
    node = spawn('node', ['app.js'], {
        stdio: 'inherit'
    })
    node.on('close', function(code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

gulp.task('default', function() {
    gulp.run('server')
    gulp.watch(['api/controllers/*.js', '*.html', '*.js', 'api/utlities/*.js'], function() {
        gulp.run('server')
    });

});

