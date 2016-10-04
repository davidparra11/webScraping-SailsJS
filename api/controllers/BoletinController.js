/**
 * BoletinController
 *
 * @description :: Server-side logic for managing boletins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	dirProcuraduria2010 = 'http://www.procuraduria.gov.co/portal/Noticias-2010.page',
	Regex = require("regex"),
	regex = new Regex(/(a|b)*abb/),
	boletinArray = [],
	boletinArrayHtml = [],
	urls = [],
	//cantBoletinesArray = [933, 726, 637, 539, 462, 439, 429],
	cantBoletinesArray = [22, 22, 22, 22, 22, 22, 22],
	yearArray = [2010, 2009, 2008, 2007, 2006, 2005, 2004],
	onceArray = [8, 9, 10, 11, 12, 13],
	i = 1,
	year = 2010,
	dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_00' + i + '.htm',
	linksArray = [],
	utils = require('../utlities/Util');

const util = require('util');
const punycode = require('punycode');
var Xray = require('x-ray');
var x = Xray();

var unorm = require('unorm');

var parrafo;

var htmlToText = require('html-to-text');

var iconv = require('iconv-lite');



var month = new Array();
month[0] = "Jan";
month[1] = "Feb";
month[2] = "Mar";
month[3] = "Apr";
month[4] = "May";
month[5] = "Jun";
month[6] = "Jul";
month[7] = "Aug";
month[8] = "Sep";
month[9] = "Oct";
month[10] = "Nov";
month[11] = "Dec";

//http://www.procuraduria.gov.co/html/noticias_2010/noticias_929.htm

module.exports = {

	/**
	 * método que hace la búsqueda y recopilación a los boletines del 2011 y despúes de la procuraduria.
	 */
	find: function(req, res) {

		if (!req.param("category")) {
			return res.send(400, "el valor de 'category' no se ha introducido.");
		}

		console.log('Recurso para tomar datos del 2011 hacia adelante.');

		var moment = require('moment');
		var now = moment();

		var testDate = require('date-utils').language("es");

		contador = 1;
		arreglo = [];

		// variable para seleccionar el año en el paginador despues del 2010.
		var category = req.param('category');

		for (var key in onceArray) {
			var direccionWeb = 'http://www.procuraduria.gov.co/portal/index.jsp?option=net.comtor.cms.frontend.component.pagefactory.NewsComponentPageFactory&action=view-category&category=' + onceArray[key] + '&wpgn=null&max_results=25&first_result=0';

			request(direccionWeb, function(err, resp, body) {
				console.log('resp ' + JSON.stringify(resp.statusCode));

				if (!err && resp.statusCode == 200) {
					//console.log('body ' + JSON.stringify(body));
					var $ = cheerio.load(body);
					console.log('$ ' + JSON.stringify($));

					$('a.news-list-title').each(function() {

						var url = $(this).attr('href');
						if (url === undefined)
							return;

						console.log('URL: ' + JSON.stringify(url));
						arreglo.push(url);

						request('http://www.procuraduria.gov.co/portal/' + url, function(err, resp, body) {
							if (!err && resp.statusCode == 200) {
								var $ = cheerio.load(body);
								var fecha = "";
								var texto = "";
								var boletin = "";
								var titulo = "";
								var fuente = "";

								//texto
								$('p.MsoNormal').each(function() {
									var urlTexto = $(this).last().text();
									texto = urlTexto.toString();
								});

								if (texto === undefined || texto == "") {
									$('div[align=justify]').each(function() {
										//var url =  $(this).attr('href');
										var datos = $(this).last().text();
										//console.log('Texto: ' + JSON.stringify(datos));
										boletinArray.push(datos);
										texto = datos.trim().toString();
									});
								}

								//titulo
								$('h2.prueba').each(function() {
									titulo = $(this).last().text().toString();
									//console.log('Tituto: ' + JSON.stringify(titulo));
								});

								//boletin
								$('h3.news-view-subtitle').each(function() {
									//var url =  $(this).attr('href');
									boletin = $(this).last().text().toString();
								});

								//fecha
								$('h4').each(function() {
									var datos = $(this).last().text();
									var pos = datos.indexOf("n:");
									var fechaSinFiltro = datos.slice(pos + 2);

									var posIni = datos.indexOf(":");
									var posDos = datos.indexOf("Fecha");
									fuente = datos.slice(posIni + 1, posDos);

									var posTres = fechaSinFiltro.indexOf(",");

									var fechaSinFormato = fechaSinFiltro.slice(posTres + 1);
									var patt1 = /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/g;

									var result = fechaSinFormato.match(patt1);
									console.log('Result: ' + result);
									//var result2 = result.toLocaleLowerCase();
									var mes = Date.getMonthNumberFromName(result.toString().trim());
									var mesNombre = month[mes];
									var fechaSinMes = fechaSinFormato.replace(result, "");
									fecha = mesNombre + ' ' + fechaSinMes;
								});

								utils.agregarToDB(boletin, titulo, texto, texto, fecha, fuente);

								boletinArray.length = 0;

							} else {
								console.log('hubo problemas con: ' + url);
								return true;
							}

						});

					});
				} //console.log(linksArray);//return
			});

		}
		return res.view('procuraduria');
	},

	findOld: function(req, res) {

		console.log('Recurso para tomar datos del 2010 hacia atrás.');

		var boletinesFalsos = [];

		var i = 10;
		var totContador = 920;
		//bucleContador(i, totContador);



		year = 2005;


		bucleContador(i, totContador);

		function bucleContador(i, totContador) {
			y = 120;
			if (i === undefined)
				i = 1;
			if (i >= totContador) return;

			request(dirInterna, function(err, resp, body) {
				i++;

				if (!err && resp.statusCode == 200) {
					var $ = cheerio.load(body);
					fecha = '';

					$('p').each(function() {
						//var url =  $(this).attr('href');
						var datos = $(this).last().text();
						//	console.log('Texto: ' + JSON.stringify(datos));marcogris2
						boletinArray.push(datos);
						fechaArray = $(this).find("strong").text();
						//console.log('Fecha:::::::::::::  ' + fechaArray.length);
						if (fechaArray.length > 16 && fecha == '' && fechaArray.length < 40 && fechaArray.search('[0-9]') != -1) // && fecha == '' 
							fecha = fechaArray;

					});

					//se implementa para sacar la fecha del archivo html.			
					$('span.textopeq').each(function() {
						var datoFecha = $(this).text();
						//console.log('Fecha: ' + JSON.stringify(datoFecha));
						//+fecha = datoFecha;
					});


					var finalParrafo = boletinArray.length - 1;
					var boletin = boletinArray.slice(0, 1).toString();
					var titulo = boletinArray.slice(1, 2).toString();
					//	var textoCompletoUno = boletinArray.slice(4, finalParrafo).toString(); //boletinArray.slice(4, 8).toString()
					var textoUnoDos = boletinArray.slice(4, 6).toString();

					/*if (textoCompletoUno.length < 60)
						boletinesFalsos.push(i);*/

					if (boletin.length == 31) {
						boletin = boletin;
					} else if (boletinArray[1].toString().length == 31) {
						boletin = boletinArray[1].toString();
					} else {
						$('td.marcogris2').each(function() {
							var datoBoletin = $(this).text();
							//+console.log('Boletin: ' + JSON.stringify(datoBoletin));
							boletin = datoBoletin;
						});
					}

					if (titulo.length > 33 && boletinArray[0].toString().length == 31) {
						titulo = titulo;
					} else if (boletinArray[0].length > 31) {
						titulo = boletinArray[0].toString();
					} else {

						//+	console.log('boletinArray[1].: ' + JSON.stringify(boletinArray[1]));
						titulo = boletinArray[1].toString();
						if (boletinArray[1].toString().length < 15)
							titulo = 'COMUNICADO DE PRENSA';
					}


					//bloque para filtrar todo el texto completo del boletin.
					if (boletinArray[1].toString().length > 99) {
						textoCompletoUno = boletinArray.slice(1, finalParrafo);

					} else if (boletinArray[2].toString().length > 99) {
						textoCompletoUno = boletinArray.slice(2, finalParrafo);

					} else {
						textoCompletoUno = boletinArray.slice(3, finalParrafo);
						if (boletinArray[2].toString().length < 99)
							textoCompletoUno = boletinArray.slice(4, finalParrafo);

					}

					if (fecha == '') {
						$('strong').each(function() {
							var datoFecha = $(this).text();
							console.log('Fecha STRONG : ' + JSON.stringify(datoFecha));
							fecha = datoFecha;
						});

					}

					if (fecha == '') {

						//var inicioFecha = textoCompletoUno.toString().indexOf(",");//indexOf es mas rapido. que search func.

						var finalFecha = textoCompletoUno.toString().search(":");

						//console.log('FechaInicial:::::::::::::  ' + inicioFecha);

						//*	console.log('Final:::::::::::::  ' + finalFecha);

						fecha = textoCompletoUno.toString().slice(0, 30);

					}
					/*

						var inicioFecha = textoCompletoUno.toString().indexOf(",");//indexOf es mas rapido. que search func.

							var finalFecha = textoCompletoUno.toString().indexOf('.');

							console.log('FechaInicial:::::::::::::  ' + inicioFecha);

							console.log('Final:::::::::::::  ' + finalFecha);
*/
					//fecha = textoCompletoUno.slice(10, finalFecha).toString();

					console.log('YEAR: ' + year + ' -i: ' + i + ' -y: ' + y);
					console.log('Boletin: ' + JSON.stringify(boletin));
					//+console.log('Titulo: ' + JSON.stringify(titulo));
					//console.log('TextoCompletoUno: ' + textoCompletoUno);
					console.log('Fecha:::::::::::::  ' + fecha);
					//console.log('Texto1y2: ' + textoUnoDos);
					var x = {
						titulo: titulo,
						boletin: boletin,
						textoCompleto: textoCompletoUno, //'textoCompleto'   jsonString
						textoUnoDos: textoUnoDos,
						fecha: fecha,
						fuente: 'no aplica'
					};
					//boletinArray.length = 0;
					//utils.agregarToDB(boletin, titulo, textoCompletoUno, textoUnoDos, fecha);
					boletinArray.length = 0;
					//return true;
					//i++;
					if (i < 10) {
						//year = 2004;
						dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_00' + i + '.htm';
						bucleContador(i, y);
					} else if (i > 9 && i < 100) {
						//console.log('YEAR: '+ year + 'i: ' + i);
						//year = 2004;
						dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_0' + i + '.htm';
						bucleContador(i, y);
					} else {
						//console.log('YEAR: '+ year + '@i: ' + i);
						//year = 2004;
						dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_' + i + '.htm';
						bucleContador(i, y);
					}

				} else {
					console.log('Hubo un error en la descarga de la página' + dirInterna + ' -i: ' + i);
					dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_' + i + '.htm';
					i++;
					bucleContador(i, y);
				}

			});
			/*request(dirInterna, function(err, resp, body) {
				
			});*/
			console.log('Boletines Falsos' + JSON.stringify(boletinesFalsos));
		}

		console.log("Boletines Falsos" + boletinesFalsos);
		return res.view('procuraduria2010');


	},

	/**
	 * Analiza un boteletin en específico para los años 2010 y anteriores.
	 */
	individual: function(req, res) {

		if (!req.param("boletin")) {
			return res.send(400, "el valor de 'boletin' no se ha introducido.");
		}

		console.log('se inició la funcion para analizr los boletines del 2010 hacia atrás. ');
		var numBoletin = req.param("boletin");
		// el valor del año para este metodo tiene un intervalo cerrado entre 2004 y 2010.
		var year = '2005';

		//El modulo cheerio carga el html de la peticion para disgregar los 
		//elementos por eiquetas; se puede observar los datos por separado con los consol.log();
		request('http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_' + numBoletin + '.htm', function(err, resp, body) {
			console.log('resp ' + JSON.stringify(resp.statusCode));

			if (!err && resp.statusCode == 200) {
				var $ = cheerio.load(body);
				var fecha = "";
				//se recueran las etiquetas p del DOM html.
				$('p').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
					console.log('Texto: ' + JSON.stringify(datos));
					boletinArray.push(datos);


					fechaArray = $(this).find("strong").text();
					//console.log('Fecha:::::::::::::  ' + fechaArray.length);
					if (fechaArray.length > 16 && fecha == '' && fechaArray.length < 40 && fechaArray.search('[0-9]') != -1) // && fecha == '' 
						fecha = fechaArray;
					console.log('Fecha strong: ' + JSON.stringify(fecha));

				});

				// bloque de variables para seleccionar las partes del html.
				var finalParrafo = boletinArray.length - 1;
				var boletin = boletinArray.slice(0, 1).toString();
				var titulo = boletinArray.slice(1, 2).toString();
				var textoCompletoUno = boletinArray.slice(4, finalParrafo).toString(); //boletinArray.slice(4, 8).toString()
				var textoUnoDos = boletinArray.slice(4, 6).toString();

				if (fecha == '') {
					$('strong').each(function() {
						var datoFecha = $(this).text();
						console.log('Fecha STRONG : ' + JSON.stringify(datoFecha));
						fecha = datoFecha;
					});
				}
				//se implementa para sacar la fecha del archivo html.			
				$('span.textopeq').each(function() {
					var datoFecha = $(this).text();
					console.log('Fecha: ' + JSON.stringify(datoFecha));
					fecha = datoFecha;
				});

				//console.log('boletinArray[3].: ' + JSON.stringify(boletinArray[3]));
				console.log('boletin: ' + JSON.stringify(boletin));
				console.log('Titulo: ' + JSON.stringify(titulo));
				console.log('TextoCompletoUno: ' + textoCompletoUno);
				console.log('Texto1y2: ' + textoUnoDos);


				//funcion para grabar los datos en DB.
				utils.agregarToDB(boletin, titulo, textoCompletoUno, textoUnoDos, fecha);

				boletinArray.length = 0;

			}

		});
		//return res.view('procuraduria');
	},

	/**
	 * Analiza un boteletin en específico para los años 2011 y posteriores.
	 */
	individual2011: function(req, res) {
		if (!req.param("tituloUrl")) {
			return res.send(400, "el valor de 'tituloUrl' no se ha introducido.");
		}

		console.log('Se inició el recurso para tomar datos de un boteltin individual del 2011 y posteriores.');
		var tituloUrl = req.param("tituloUrl");

		//La funcion lanza la peticion a la direccion definida y toma diferentes
		//etiquetas del DOM.
		request.get({
				uri: 'http://www.procuraduria.gov.co/portal/' + tituloUrl,
				encoding: null
			},
			function(err, resp, body) {
				var bodyWithCorrectEncoding = iconv.decode(body, 'iso-8859-1');
				
				if (!err && resp.statusCode == 200) {
					var $ = cheerio.load(bodyWithCorrectEncoding, {
						decodeEntities: true
					});
					var fecha = "";
					var texto = "";
					var boletin = "";
					var titulo = "";
					var fuente = "";

					$('p.MsoNormal').each(function() {
						//var url =  $(this).attr('href');
						var url = $(this).last().text();
						texto = url.toString();

					});

					if (texto === undefined || texto == "") {
						$('div[align=justify]').each(function() {
							//var url =  $(this).attr('href');
							var datos = $(this).last().text();
							texto = datos;
							console.log('Texto: ' + texto);
						});
					}

					console.log('Texto: ' + texto);

					//titulo
					$('h2.prueba').each(function() {
						//var url =  $(this).attr('href');
						var datos = $(this).last().text(); //encode_utf8
						titulo = decodeURIComponent(datos);
						console.log('Tituto: ' + titulo);
					});

					//boletin
					$('h3.news-view-subtitle').each(function() {
						//var url =  $(this).attr('href');
						var datos = $(this).last().text().toString();
						boletin = punycode.ucs2.decode(datos);
						console.log('Boletin: ' + boletin);
					});

					//fecha y fuente
					$('h4').each(function() {
						var datos = $(this).last().text();

						var pos = datos.indexOf("n:");
						var fechaSinFiltro = datos.slice(pos + 2);
						var posIni = datos.indexOf(":");
						var posDos = datos.indexOf("Fecha");
						fuente = datos.slice(posIni + 1, posDos);
						var posTres = fechaSinFiltro.indexOf(",");

						var fechaSinFormato = fechaSinFiltro.slice(posTres + 1);
						var patt1 = /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/g;

						var result = fechaSinFormato.match(patt1);
						console.log('Result: ' + result);
						//var result2 = result.toLocaleLowerCase();
						var mes = Date.getMonthNumberFromName(result.toString().trim());
						var mesNombre = month[mes];

						var fechaSinMes = fechaSinFormato.replace(result, "");

						fecha = mesNombre + ' ' + fechaSinMes;

					});
					console.log('FECHAs: ' + fecha);
					console.log('FECHA UTV: ' + Date.parse(fecha));
					//Método para agregar las variables a la DB.
					//utils.agregarToDB(boletin, titulo, texto, texto, fecha);//.dateParser()( "11/30/2010" )
					boletinArray.length = 0;

				}
			});
		//return res.view('procuraduria');
	}
};