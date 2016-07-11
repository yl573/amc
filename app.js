var test;
if (process.platform === 'win32') {
    test = true;
    port = 8080;
    server = "localhost";
} else {
    test = false;
    port = 80;
    server = "ec2-52-40-250-121.us-west-2.compute.amazonaws.com";
}

try {
    var express = require('express');
    var formidable = require('formidable');
    var path = require('path');
    var fs = require('fs');
    var morgan = require('morgan');
    var exec = require('child_process').exec;

    var port;
    var server;

    var app = express();
    app.use(morgan('dev'));
    app.use(express.static(__dirname));

    app.use('/upload/:project_name', function(req, res, next) {
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        var form = new formidable.IncomingForm();
        form.multiples = true;
        form.uploadDir = path.join(__dirname, '/Projects/' + req.params.project_name);

        form.on('file', function(field, file) {
            fs.rename(file.path, path.join(form.uploadDir, file.name));
            res.write('Your latex ' + file.name + ' has been add!');
        });

        form.on('error', function(err) {
            console.log('An error has occured: \n' + err);
        });

        form.on('end', function() {
            res.end();
        });

        form.parse(req);
    });

    app.route('/init')
        .all(function(req, res, next) {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end("Please specify the project to be created");
        });

    app.route('/init/:project_name')
        .all(function(req, res, next) {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            init_project(req.params.project_name);
            res.end("Project " + req.params.project_name + " Created");
        });

    app.route('/download/:project_name')
        .all(function(req, res, next) {

            fs.readdir(__dirname + '/Projects/' + req.params.project_name, function(err, files) {
                if (err) {
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end("Project not found");
                }

                var target_file = "not found";
                for (var i = 0; i < files.length; i++) {
                    console.log(files[i]);
                    if (files[i].endsWith('sujet.pdf'))
                        target_file = files[i];
                }

                if (target_file === "not found") {
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end("No test pdf availiable");
                } 
                else {
                    var download_path = path.resolve('./Projects/' + req.params.project_name + '/' + target_file);
                    console.log("download " + download_path);
                    res.download(download_path, 'test.pdf');
                }
            })
        });

    app.use('/convert/:project_name', function(req, res, next) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        fs.readdir(__dirname + '/Projects/' + req.params.project_name, function(err, files) {
            if (err) 
            {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end("Project not found");
            }

            var target_file = "not found";
            for (var i = 0; i < files.length; i++) 
            {
                console.log(files[i]);
                if (files[i].endsWith('.tex'))
                    target_file = files[i];
            }

            if (target_file === "not found") 
            {
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end("No .tex file availiable");
            } 
            else 
            {
                prepare_pdf(req.params.project_name, target_file)
                // console.log("excecuting script...");
                res.end('test pdf has been prepared');
            }
        });
    });

    app.listen(port, server, function() {
        console.log("server running on " + server + " port:" + port);
    });
} catch (err) {
    console.log(err);
}

function init_project(project_name) {
    if (test) {
        exec('win_init_project.bat ' + project_name);
    } else {
        exec('lin_init_project.sh' + project_name);
    }
}

function prepare_pdf(project_name, latex_file) {
    exec('auto-multiple-choice prepare --mode s --prefix ./' + project_name + ' ./' + project_name + '/' + latex_file)
        // console.log('auto-multiple-choice prepare --mode s --prefix ./' + project_name + ' ./' + project_name + '/' + latex_file);
}