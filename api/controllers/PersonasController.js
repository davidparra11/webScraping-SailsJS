/**
 * PersonasController
 *
 * @description :: Server-side logic for managing Personas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	fsc = require("fs-cheerio"),
	direccionLocal = 'C:/Users/HP 14 V014/Desktop/Contratistas/Contratistas/busquedas.dafp.gov.co/',
	onceArray = [8, 9, 10, 11, 12, 13],
	i = 1,
	year = 2010,
	dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_00' + i + '.htm',
	direccionWebContraloria = 'http://www.sigep.gov.co/hdv/-/directorio/M748256-0262-4/view',
	Regex = require("regex"),
	linksArray = [],
	utils = require('../utlities/Util');

//var doc = new jsPDF();

var Xray = require('x-ray');
var x = Xray();

var walk = require('walk');
var filesArray = [];
var linkPersonasArray = [];

var phantom = require('phantom');

//http://www.procuraduria.gov.co/html/noticias_2010/noticias_929.htm

module.exports = {
	//para analizar los archivos locales descargados de la Contraloria (de manera individual)
	analizar: function(req, res) {

		console.log('Analizar datos de la Contraloria.');

		var $ = cheerio.load(fs.readFileSync('C:/Users/HP 14 V014/Desktop/Contratistas/Contratistas/busquedas.dafp.gov.co/search000d.html'));

		$('a[ctype=c]').each(function() {
			var url = $(this).attr('href');
			//var url = $(this).text();  $('b')
			console.log('Texto: ' + JSON.stringify(url));

		});

		// for(var i in allImgs){

		// } cheerio.load(fs.readFileSync('path/to/file.html'));


		request(fs.readFileSync(direccionLocal + 'search000d.html'), function(err, resp, body) {
			//	console.log('resp ' + JSON.stringify(resp.statusCode));

			if (!err && resp.statusCode == 200) {
				//console.log('body ' + JSON.stringify(body));
				var $ = cheerio.load(body);
				console.log('$ ' + JSON.stringify($)); //#content', '#titulo_zona_noticias', a.title, 

				/*$('a.news-list-title').each(function() {
					//var url =  $(this).attr('href');
					var url = $(this).text();
				//	console.log('Texto: ' + JSON.stringify(url));
					/*if(url.indexOf('i.imgur.com')!= -1){
					 urls.push(url);
					 console.log('URLS ' + JSON.stringify(urls));
					 }

				});*/

				$('b').each(function() {
					//var url =  $(this).attr('href');
					var url = $(this).text();
					console.log('Texto: ' + JSON.stringify(url));
					/*if(url.indexOf('i.imgur.com')!= -1){
					 urls.push(url);
					 console.log('URLS ' + JSON.stringify(urls));
					 }
					if (url !== undefined)
						linksArray.push(url);*/
				});
			} else {
				console.log('error en la descarga');
			} //console.log(linksArray);//return

		});
		return res.view('procuraduria');

	},
	//recorrer los archivos descargados en la ruta local
	recogerTodo: function(req, res) {

		var walker = walk.walk('C:/Users/HP 14 V014/Desktop/Contratistas/Contratistas/busquedas.dafp.gov.co', {
			followLinks: false
		});

		walker.on('file', function(root, stat, next) {
			// Add this file to the list of files
			files.push(root + '/' + stat.name);
			next();
		});

		walker.on('end', function() {
			console.log(files);
		});
	},

	generarHtml: function(req, res) {

		request('http://www.sigep.gov.co/hdv/-/directorio/M1846088-4714-4/view').pipe(fs.createWriteStream('./htmls/PruebaProcu.html'));
		return res.view('contraloria');
	},

	individualContraloria: function(req, res) {

		var $ = cheerio.load(fs.readFileSync('C:/Users/HP 14 V014/Desktop/Contratistas/Contratistas/busquedas.dafp.gov.co/search000d.html'));

		$('b').each(function() {
			//var url =  $(this).attr('href');
			var url = $(this).text();
			console.log('Texto: ' + JSON.stringify(url));
			/*if(url.indexOf('i.imgur.com')!= -1){
			 urls.push(url);
			 console.log('URLS ' + JSON.stringify(urls));
			 }
			if (url !== undefined)
				linksArray.push(url);*/
		});

		$('a[ctype=c]').each(function() {
			//var url =  $(this).attr('href');
			var url = $(this).text().toString();
			var nombre = url.replace(/\t/g, "")
				.replace(/\n/g, "")
				.trim()
				.replace(/ /g, '_'); //.replace("/\n/gi,", ".")  [a-zA-Z]+
			var nombreUno;

			console.log('Nombre replace: ' + nombre);

			/*if(url.indexOf('i.imgur.com')!= -1){
			 urls.push(url);
			 console.log('URLS ' + JSON.stringify(urls));
			 }
			if (url !== undefined)
				linksArray.push(url);*/
		});

	},

	descargaHtmls: function(req, res) {
		//var test = function(){
		console.log('hola mundo');

		var walker = walk.walk('C:/Users/HP 14 V014/Desktop/Contratistas/Contratistas/busquedas', { //busquedas.dafp.gov.co
			followLinks: false
		});
		var i = 1;

		walker.on('file', function(root, stat, next) {
			console.log('hola mundo insade');
			// Add this file to the list of files
			//filesArray.push(root + '/' + stat.name);
			var $ = cheerio.load(fs.readFileSync(root + '/' + stat.name));

			$('a[ctype=c]').each(function() {
				var url = $(this).attr('href');
				//var nombre = $(this).text();
				var testNombre = 'test';
				var nombreUno = $(this).text().toString();
				var nombre = nombreUno.replace(/\t/g, "")
					.replace(/\n/g, "")
					.trim()
					.replace(/ /g, '_'); //.replace("/\n/gi,", ".")  [a-zA-Z]+
				//var url = $(this).text();  $('b')
				//console.log('Texto: ' + JSON.stringify(url));  
				//linkPersonasArray.push(url);

				request(url).pipe(fs.createWriteStream('./htmls/' + nombre + '.html'));
			});

			next();
		});

		/*walker.on('end', function() {
			console.log(files);
		});*/


		

		//}fin de la funcion



		return res.view('procuraduria');
		//test();


	}

};