/**
 * PersonasController
 *
 * @description :: Server-side logic for managing Personas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	direccionLocal = 'C:/Users/Sergio/Documents/Sidif/Desarrollo/Software/NodeJs/sidif/Contraloria/',
	onceArray = [8, 9, 10, 11, 12, 13],
	i = 1,
	year = 2010,
	dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_00' + i + '.htm',
	direccionWebContraloria = 'http://www.sigep.gov.co/hdv/-/directorio/M748256-0262-4/view',
	Regex = require("regex"),
	linksArray = [],
	nombreArray = [],
	personaArray = [],
	formacionArray = [],
	nacimientoArray = [],
	utils = require('../utlities/Util');

var walk = require('walk');
var filesArray = [];
var linkPersonasArray = [];

//http://www.procuraduria.gov.co/html/noticias_2010/noticias_929.htm

module.exports = {

	/**
	 * método que recupera las HVs de los contratistas, los pasa a HTML y guarda datos importantes en DB.
	 */
	descargaHtmls: function(req, res) {

		console.log('Recurso para tomar datos de las personas en la página Contraloria y crear archivos HTML...');

		var walker = walk.walk(process.env.RUTA_CONTRATISTAS, { //busquedas.dafp.gov.co
			followLinks: false
		});
		var i = 1;

		try {
			walker.on('file', function(root, stat, next) {
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
							var fecha = "";
							var cargo = "";
							var institucion_funcionario = "";
							var lugar_nacimiento = "";
							//nombre
							$('span.nombre_funcionario').each(function() {
								//var url =  $(this).attr('href');
								var datos = $(this).last().text();
								console.log('Nombre: ' + JSON.stringify(datos));
								nombre = datos.toUpperCase();
							});
							//cargo funcionario
							$('span.cargo_funcionario').each(function() {
								//var url =  $(this).attr('href');
								var datos = $(this).last().text();
								//console.log('cargo: ' + JSON.stringify(datos));
								cargo = datos;
							});
							//Entidad
							$('span.institucion_funcionario').each(function() {
								//var url =  $(this).attr('href');
								var datos = $(this).last().text();
								//console.log('institucion_funcionario: ' + JSON.stringify(datos));
								institucion_funcionario = datos;
							});
							// formacion académica
							$('ul').each(function() {
								//var url =  $(this).attr('href');
								var datos = $(this).last().text();
								///console.log('Formacion Académica: ' + JSON.stringify(datos));
								formacionArray.push(datos);
							});
							// Lugar de nacimiento
							$('span').each(function() {
								//var url =  $(this).attr('href');
								var datos = $(this).last().text();
								nacimientoArray.push(datos);
							});

							lugar_nacimiento = nacimientoArray[21];

							relacionadoConDefault = 'CONTRALORÍA: DIRECTORIO DE FUNCIONARIOS Y CONTRATISTAS 2016, ';

							relacionadoCon = relacionadoConDefault + institucion_funcionario + ' ' + lugar_nacimiento + ', ' + cargo;

							direccion = lugar_nacimiento;

							//utils.addPersonasToDB(nombre, relacionadoCon, direccion, nombre);

							

							fechaHoy = new Date();

							var dia = ("0" + fechaHoy.getDate()).slice(-2);
							var mes = ("0" + (fechaHoy.getMonth() + 1)).slice(-2)
							var anio = fechaHoy.getFullYear();

							fecha = anio + '' + mes + '' + dia;


							console.log('Fecha: ' + fecha);
							console.log('fechaHoy: ' + fechaHoy);

							//console.log('Lugar de nacimiento: ' + JSON.stringify(nacimientoArray[21]));

							console.log('RelacionadoCon: ' + relacionadoCon);

							var ingresaLista = 'INGRESA_LISTA: ' + fecha;

							utils.addPersonasToDB(nombre, relacionadoCon, direccion, fecha, ingresaLista, nombre);

							request(url).pipe(fs.createWriteStream('./htmls/' + nombreSinEspacios + '.html'));
							
							correo = personaArray[0];
							telefono = personaArray[1];
							formacionAcademica = formacionArray[2];

							formacionArray.length = 0;
							nacimientoArray.length = 0;

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
		} catch (e) {
			console.log('Error: ' + e)
		}


	},

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

		console.log('personaContrlaoria recurso...');

		var direccionWeb = 'http://www.sigep.gov.co/hdv/-/directorio/M571786-0896-4/view';
		request(direccionWeb, function(err, resp, body) {
			//console.log('resp ' + JSON.stringify(resp.statusCode));21

			if (!err && resp.statusCode == 200) {
				var $ = cheerio.load(body);
				var cargo = "";
				var institucion_funcionario = "";
				var lugar_nacimiento = "";
				//nombre
				$('span.nombre_funcionario').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
					console.log('Nombre: ' + JSON.stringify(datos));
					nombre = datos;
				});
				//cargo funcionario
				$('span.cargo_funcionario').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
					console.log('cargo: ' + JSON.stringify(datos));
					cargo = datos;
				});
				//Entidad
				$('span.institucion_funcionario').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
					console.log('institucion_funcionario: ' + JSON.stringify(datos));
					institucion_funcionario = datos;
				});
				// formacion académica
				$('ul').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
					///console.log('Formacion Académica: ' + JSON.stringify(datos));
					formacionArray.push(datos);
				});
				// Lugar de nacimiento
				$('span').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
					nacimientoArray.push(datos);
				});

				lugar_nacimiento = nacimientoArray[21];

				relacionadoConDefault = 'CONTRALORÍA: DIRECTORIO DE FUNCIONARIOS Y CONTRATISTAS 2016, ';

				relacionadoCon = relacionadoConDefault + institucion_funcionario + ' ' + lugar_nacimiento + ', ' + cargo;

				//utils.addPersonasToDB(nombre, relacionadoCon, direccion);

				console.log('Lugar de nacimiento: ' + JSON.stringify(nacimientoArray[21]));

				console.log('RelacionadoCon: ' + relacionadoCon);


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

	}


};