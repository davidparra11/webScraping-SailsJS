/**
 * PersonasController
 *
 * @description :: Server-side logic for managing Personas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	direccionLocal = 'C:/Users/HP 14 V014/Desktop/Contratistas/Contratistas/busquedas.dafp.gov.co/',
	onceArray = [8, 9, 10, 11, 12, 13],
	i = 1,
	year = 2010,
	dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_00' + i + '.htm',
	direccionWebContraloria = 'http://www.sigep.gov.co/hdv/-/directorio/M748256-0262-4/view',
	Regex = require("regex"),
	linksArray = [],
	personaArray = [],
	formacionArray = [],
	utils = require('../utlities/Util');

var walk = require('walk');
var filesArray = [];
var linkPersonasArray = [];

//http://www.procuraduria.gov.co/html/noticias_2010/noticias_929.htm

module.exports = {
	//para analizar los archivos locales descargados de la Contraloria (de manera individual)
	analizar: function(req, res) {

		console.log('Analizar datos de la Contraloria.');

		var $ = cheerio.load(fs.readFileSync('C:/Users/HP 14 V014/Desktop/Contratistas/Contratistas/busquedas.dafp.gov.co/search000d.html'));

		$('a[ctype=c]').each(function() {
			var url = $(this).attr('href');
			console.log('Texto: ' + JSON.stringify(url));
		});
		request(fs.readFileSync(direccionLocal + 'search000d.html'), function(err, resp, body) {
			//	console.log('resp ' + JSON.stringify(resp.statusCode));

			if (!err && resp.statusCode == 200) {
				//console.log('body ' + JSON.stringify(body));
				var $ = cheerio.load(body);
				console.log('$ ' + JSON.stringify($)); 

				$('b').each(function() {
					//var url =  $(this).attr('href');
					var url = $(this).text();
					console.log('Texto: ' + JSON.stringify(url));					
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

	personaContraloria: function(req, res) {

		var direccionWeb = 'http://www.sigep.gov.co/hdv/-/directorio/M571786-0896-4/view';
		request(direccionWeb, function(err, resp, body) {
			//console.log('resp ' + JSON.stringify(resp.statusCode));

			if (!err && resp.statusCode == 200) {
				var $ = cheerio.load(body);
				var correo = "";
				var telefono = "";
				var formacion = "";
				//nombre
				$('span.nombre_funcionario').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
					console.log('Nombre: ' + JSON.stringify(datos));
					nombre = datos;
				});
				//correo y teléfono
				$('span.texto_detalle_directorio').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
					console.log('correo: ' + JSON.stringify(datos));
					personaArray.push(datos);
				});
				// formacion académica
				$('ul').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
					console.log('Formacion Académica: ' + JSON.stringify(datos));
					formacionArray.push(datos);
				});

				correo = personaArray[0];
				telefono = personaArray[1];
				formacionAcademica = formacionArray[2];

				personaArray.length = 0;
				formacionArray.length = 0;
			}

		});

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
		console.log('Recurso para tomar datos de las personas en la pagina Contraloria y crear archivos HTML...');

		var walker = walk.walk('C:/Users/HP 14 V014/Desktop/Contratistas/Contratistas/busquedas', { //busquedas.dafp.gov.co
			followLinks: false
		});
		var i = 1;

		walker.on('file', function(root, stat, next) {
			//filesArray.push(root + '/' + stat.name);
			var $ = cheerio.load(fs.readFileSync(root + '/' + stat.name));

			$('a[ctype=c]').each(function() {
				var url = $(this).attr('href');
				//var nombre = $(this).text();
				var testNombre = 'test';
				var nombreUno = $(this).text().toString();
				var nombreSinEspacios = nombreUno.replace(/\t/g, "")
					.replace(/\n/g, "")
					.trim()
					.replace(/ /g, '_'); 
				request(url, function(err, resp, body) {
					if (!err && resp.statusCode == 200) {
						var $ = cheerio.load(body);
						var correo = "";
						var telefono = "";
						var formacion = "";
						//nombre
						$('span.nombre_funcionario').each(function() {
							var datos = $(this).last().text();
							//console.log('Nombre: ' + JSON.stringify(datos));
							nombre = datos;
						});
						//correo y teléfono
						$('span.texto_detalle_directorio').each(function() {
							var datos = $(this).last().text();
							personaArray.push(datos);
						});
						// formacion académica
						$('ul').each(function() {
							//var url =  $(this).attr('href');
							var datos = $(this).last().text();
							formacionArray.push(datos);
						});
						
						correo = personaArray[0];
						telefono = personaArray[1];
						formacionAcademica = formacionArray[2];

						utils.addPersonasToDB(nombre, correo, telefono, 'otro');
						request(url).pipe(fs.createWriteStream('./htmls/' + nombreSinEspacios + '.html'));

						personaArray.length = 0;
						formacionArray.length = 0;
					}

				});

			});
			next();
		});

		/*walker.on('end', function() {
			console.log(files);
		});*/
		return res.view('procuraduria');
		//test();
	}

};