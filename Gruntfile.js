'use strict';

module.exports = function (grunt) {
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    require('time-grunt')(grunt);

    var wiringConfig = {   
        port: 3000,

        backend: {
            dir: 'backend',
            port: 1338,
            publicDir: 'www'
        },

        frontend: {
            dir: 'frontend',
            port: 9000
        },

        distFolder: 'dist'
    };
    
    grunt.initConfig({
        // Configuration about how frontend and backend should be sticked together
        wiring: wiringConfig,

        nodemon: { // Running backend server
            serveBackend: {
                script: 'app.js',
                options: {
                    cwd: __dirname + '/' + '<%= wiring.backend.dir %>',
                    env: {
                        PORT: '<%= wiring.backend.port %>'
                    }
                }
            }
        },

        subgrunt: { // Running frontend watch tasks
            serveFrontend: {    
                frontend: 'serve'
            },
            buildFrontend: {
                frontend: 'build'
            },
            buildBackend: {
                backend: 'buildProd'
            }
        },

        connect: { // TODO add livereload
            serve: {
                options: {
                    open: true,
                    port: '<%=wiring.port %>',
                    hostname: 'localhost',
                    keepalive : true,
                    middleware: function (connect, options, defaultMiddleware) {
                        var proxyUtils = require('grunt-connect-proxy/lib/utils'),
                            frontendProxy = proxyUtils.proxies()[0],
                            backendProxy = proxyUtils.proxies()[1];
                        
                        // Checks if frontend file exists, on 404 passes
                        var frontendHandler = function(req, res, next) {
                            var fakeRes = require('node-mocks-http').createResponse({
                                eventEmitter: require('events').EventEmitter
                            });

                            fakeRes.on('end', function() {
                                if (fakeRes.statusCode === 404) {
                                    next();
                                } else {
                                    frontendProxy.server.web(req, res);
                                }
                            });

                            frontendProxy.server.web(req, fakeRes);
                            frontendProxy.server.on('error', function(error) {
                                if (!res.headersSent) {
                                    res.setHeader('Content-type', 'text/html');
                                    res.end('Wait until frontend and backend servers are up!'+
                                        '<script type="text/javascript">'+
                                        'setTimeout(function(){ window.location.reload(1); }, 2000);'+
                                        '</script>'
                                    );
                                }
                            });
                        };

                        // Proxies request to backend
                        var backendHandler = function(req, res, next) {
                            backendProxy.server.web(req, res);
                        }
                       
                        return [
                            frontendHandler,
                            backendHandler
                        ].concat(defaultMiddleware);
                    }
                },
                proxies: [{
                    context: '/',
                    host: 'localhost',
                    port: '<%= wiring.frontend.port %>'
                },
                {
                    context: '/',
                    host: 'localhost',
                    port: '<%= wiring.backend.port %>'
                }]
            },
        },

        concurrent: { // Allows nodemon(backend) and watch(frontend) in single terminal window
            serve: { 
                tasks: [
                    'nodemon:serveBackend', 
                    'subgrunt:serveFrontend', 
                    'wiringServe'
                ],
                options: {
                      logConcurrentOutput: true
                }
            }
        },

        clean: {
            build: ['<%=wiring.distFolder%>'],
            backendPublic: ['<%=wiring.distFolder%>/<%=wiring.backend.publicDir%>']
        },

        copy: {
            backendBuild: {
                files: [
                    { 
                        expand: true, 
                        cwd: '<%=wiring.backend.dir%>', 
                        src: ['*'], 
                        dest: '<%=wiring.distFolder%>' 
                    }
                ]
            },
            frontendBuild: {
                files: [
                    {
                        expand: true, 
                        cwd: '<%=wiring.frontend.dir%>/dist', 
                        src: ['*'], 
                        dest: '<%=wiring.distFolder%>/<%=wiring.backend.publicDir%>' 
                    }
                ]
            }
        }
    });

    grunt.registerTask('wiringServe', [
        'configureProxies:serve',
        'connect:serve'
    ]);

    grunt.registerTask('serve', 'Compile and start frontend with livereload and backend with watch', [
        'concurrent:serve'
    ]);


    grunt.registerTask('build', 'Build frontend, build backend and link things together', [
        'clean:build',
        'subgrunt:buildFrontend',
        'copy:backendBuild',
        'clean:backendPublic',
        'copy:frontendBuild'
    ]);
    

    // Run backend with nodemon 
    // Watch frontend with grunt-contrib-watch
    // Disable sails hooks and assets compilation
};