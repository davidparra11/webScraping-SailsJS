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
	cantBoletinesArray = [22, 23, 24, 25, 26, 27, 28],
	yearArray = [2010, 2009, 2008, 2007, 2006, 2005, 2004],
	onceArray = [8, 9, 10, 11, 12, 13],
	onceYearArray = [2011, 2012, 2013, 2014, 2015, 2016],
	i = 1,
	year = 2010,
	//dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_00' + i + '.htm',
	linksArray = [],
	utils = require('../utlities/Util');

const util = require('util');
const punycode = require('punycode');
var Xray = require('x-ray');
var x = Xray();
var unorm = require('unorm');
var htmlToText = require('html-to-text');
var iconv = require('iconv-lite');
var y = 0;
var phantom = require('phantom');
var htmlToPdf = require('html-to-pdf');
var webshot = require('webshot');


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
	 * método que hace la búsqueda y recopilación a los boletines del 2011 y años posteriores de la procuraduria.
	 */
	boletinesNuevos: function(req, res) {

		console.log('Recurso para tomar datos de todos los boletines del 2011 hacia adelante.');

		var moment = require('moment');
		var now = moment();
		var testDate = require('date-utils').language("es");
		contador = 1;

		for (var key in onceArray) {
			var direccionWeb = 'http://www.procuraduria.gov.co/portal/index.jsp?option=net.comtor.cms.frontend.component.pagefactory.NewsComponentPageFactory&action=view-category&category=' + onceArray[key] + '&wpgn=null&max_results=25&first_result=0';
			request(direccionWeb, function(err, resp, body) {
				//console.log('resp ' + JSON.stringify(resp.statusCode));
				if (!err && resp.statusCode == 200) {
					////console.log('body ' + JSON.stringify(body));
					var $ = cheerio.load(body);
					$('a.news-list-title').each(function() {
						var url = $(this).attr('href');
						if (url === undefined)
							return;
						//console.log('URL: ' + JSON.stringify(url));arreglo.push(url);
						request.get({
								uri: 'http://www.procuraduria.gov.co/portal/' + url,
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
									var yearBoletin = "";


									//texto
									$('p.MsoNormal').each(function() {
										var urlTexto = $(this).last().text();
										texto = urlTexto.toString();
									});

									if (texto === undefined || texto == "") {
										$('div[align=justify]').each(function() {
											var datos = $(this).last().text();
											boletinArray.push(datos);
											texto = datos.trim().toString();
										});
									}

									//parrafos (uno y dos) del texto
									$('p').each(function() {
										var datos = $(this).last().text();
										boletinArray.push(datos);
									});
									var textoUnoDos = boletinArray.slice(41, 43).toString();

									//titulo
									$('h2.prueba').each(function() {
										titulo = $(this).last().text().toString();
									});

									//boletin
									$('h3.news-view-subtitle').each(function() {
										boletin = $(this).last().text().toString();
									});

									//fecha y fuente.
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
										//console.log('Result: ' + result);
										//var result2 = result.toLocaleLowerCase();
										var mes = Date.getMonthNumberFromName(result.toString().trim());
										var mesNombre = month[mes];
										var fechaSinMes = fechaSinFormato.replace(result, "");
										fecha = mesNombre + ' ' + fechaSinMes;

										var patt2 = /(2011|2012|2013|2014|2015|2016)/g;
										yearBoletin = fechaSinFormato.match(patt2);
									});

									var boletinSinEspacios = boletin.replace(/ /g, "_");
									console.log('Boletin: ' + boletin + 'Año: ' + yearBoletin);

									var fechaSinCodificacion = fecha;
									//fechaSinCodificacion = fechaSinCodificacion.replace(/de/gi, "");

									fechaCodificada = Date.parse(fechaSinCodificacion);

									dirWeb = 'http://www.procuraduria.gov.co/portal/' + url;

									dirLocalHtml = './htmlBoletines/' + yearBoletin + '_' + boletinSinEspacios + '.html';
									//agregar datos de las variables a la base de datos.
									utils.agregarToDB(boletin, titulo, texto, textoUnoDos, fechaCodificada, 'Procuraduria', dirWeb, '', dirLocalHtml);

									request('http://www.procuraduria.gov.co/portal/' + url).pipe(fs.createWriteStream('./htmlBoletines/' + yearBoletin + '_' + boletinSinEspacios + '.html'));
									boletinArray.length = 0;
								} else {
									console.log('hubo problemas con: ' + url);
									return true;
								}
							});
					});
				} ////console.log(linksArray);//return
			});
		}
		return res.view('procuraduria');
	},
	/**
	 * método que hace la búsqueda y recopilación a los boletines del 2010 y años anteriores de la procuraduría.
	 */
	boletinesAntiguos: function(req, res) {

		console.log('Recurso para tomar datos de todos los boletines del 2010 hacia atrás...');

		var moment = require('moment');
		var now = moment();
		var testDate = require('date-utils').language("es");
		var pdf = require('html-pdf');

		var boletinesFalsos = [];
		//var i = 1;
		//var totContador = 920;

		bucleContador(cantBoletinesArray[y], y);
		if (y > 6) {
			return;
		}

		function bucleContador(totContador, llave) {
			if (y > 6) {
				return;
			}
			//console.log('totContador: ' + totContador + 'llave: ' + llave);
			if (i === undefined)
				i = 1;
			if (i >= totContador) {
				i = 0;
				y++;
				//console.log('Y: ' + y + 'llave: ' + llave + 'cantBoletinesArray: ' + cantBoletinesArray[y]);
				bucleContador(cantBoletinesArray[y], y);
			}
			i++;
			////console.log('hol mundo' + totContador + 'llave: ' + llave);
			loopBoletin(i, llave);
		}

		function loopBoletin(i, llave) {

			if (i < 10) {
				var dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + yearArray[llave] + '/noticias_00' + i + '.htm';
			} else if (i > 9 && i < 100) {
				var dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + yearArray[llave] + '/noticias_0' + i + '.htm';
			} else {
				var dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + yearArray[llave] + '/noticias_' + i + '.htm';
			}
			request(dirInterna, function(err, resp, body) {
				if (!err && resp.statusCode == 200) {
					var $ = cheerio.load(body);
					fechaCodificada = '';
					fecha = '';

					$('p').each(function() {
						var datos = $(this).last().text();
						boletinArray.push(datos);
						fechaArray = $(this).find("strong").text();
						if (fechaArray.length > 16 && fecha == '' && fechaArray.length < 40 && fechaArray.search('[0-9]') != -1) // && fecha == '' 
							fecha = fechaArray;
					});

					var finalParrafo = boletinArray.length - 1;
					var boletin = boletinArray.slice(0, 1).toString();
					var titulo = boletinArray.slice(1, 2).toString();
					//	var textoCompletoUno = boletinArray.slice(4, finalParrafo).toString(); //boletinArray.slice(4, 8).toString()
					var textoUnoDos = boletinArray.slice(4, 6).toString();
					/*if (textoCompletoUno.length < 60)
						boletinesFalsos.push(i);*/
					if (boletin.length == 31) {
						boletin = boletin.slice(20);
					} else if (boletinArray[1].toString().length == 31) {
						boletin = boletinArray[1].toString().slice(20);
					} else {
						$('td.marcogris2').each(function() {
							var datoBoletin = $(this).text();
							//+//console.log('Boletin: ' + JSON.stringify(datoBoletin));
							boletin = datoBoletin.slice(20);
						});
					}

					if (titulo.length > 33 && boletinArray[0].toString().length == 31) {
						titulo = titulo.trim();
					} else if (boletinArray[0].length > 31) {
						titulo = boletinArray[0].toString().trim();
					} else {
						//+	//console.log('boletinArray[1].: ' + JSON.stringify(boletinArray[1]));
						titulo = boletinArray[1].toString();
						if (boletinArray[1].toString().length < 15)
							titulo = 'COMUNICADO DE PRENSA';
					}
					//bloque para filtrar todo el texto completo del boletin.
					if (boletinArray[1].toString().length > 99) {
						var textoCompletoUnoAnterior = boletinArray.slice(1, finalParrafo);
						textoCompletoUno = textoCompletoUnoAnterior.toString().trim()

					} else if (boletinArray[2].toString().length > 99) {
						var textoCompletoUnoAnterior = boletinArray.slice(2, finalParrafo);
						textoCompletoUno = textoCompletoUnoAnterior.toString().trim();

					} else {
						var textoCompletoUnoAnterior = boletinArray.slice(3, finalParrafo);
						textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
						if (boletinArray[2].toString().length < 99)
							var textoCompletoUnoAnterior = boletinArray.slice(4, finalParrafo);
						textoCompletoUno = textoCompletoUnoAnterior.toString().trim();

					}

					if (fecha == '') {
						$('strong').each(function() {
							var datoFecha = $(this).text();
							//console.log('Fecha STRONG : ' + JSON.stringify(datoFecha));
							fecha = datoFecha.trim();
						});
					}

					if (fecha == '') {
						var finalFecha = textoCompletoUno.toString().search(":");
						fecha = textoCompletoUno.toString().slice(0, 30).trim();
					}

					var boletinSinEspacios = boletin.replace(/ /g, "_");

					var posTres = fecha.indexOf(",");

					var fechaSinFormato = fecha.slice(posTres + 1);
					var patt1 = /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/g;

					var result = fechaSinFormato.match(patt1);
					//console.log('Result: ' + result);
					//var result2 = result.toLocaleLowerCase();
					if (result === null)
						result = 'enero';

					var mes = Date.getMonthNumberFromName(result.toString().trim());
					var mesNombre = month[mes];


					var fechaSinMes = fechaSinFormato.replace(result, "");
					var fechaSinCodificacion = mesNombre + ' ' + fechaSinMes;
					fechaSinCodificacion = fechaSinCodificacion.replace(/de/gi, "");

					fechaCodificada = Date.parse(fechaSinCodificacion);
					console.log('YEAR: ' + yearArray[llave] + ' -i: ' + i + ' -y: ' + y);
					console.log('Boletin: ' + JSON.stringify(boletin));

					dirLocalHtml = './htmlBoletines/' + yearArray[llave] + '_' + boletinSinEspacios + '.html';
					dirLocalPdf = './pdfBoletines/' + yearArray[llave] + '_' + boletinSinEspacios + '.pdf';

					//agregar datos de las variables a la base de datos.
					utils.agregarToDB(boletin, titulo, textoCompletoUno, textoUnoDos, fechaCodificada, 'Procuraduria', dirInterna, '', dirLocalHtml);

					request(dirInterna).pipe(fs.createWriteStream('./htmlBoletines/' + yearArray[llave] + '_' + boletinSinEspacios + '.html'));
					boletinArray.length = 0;
				} else {
					console.log('Hubo un error en la descarga de la página: - ' + dirInterna + ' -i: ' + i);
					boletinesFalsos.push(i);
					console.log('direccion: ' + boletinesFalsos);
					//dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + yearArray[key] + '/noticias_' + i + '.htm';
				}
			});
			bucleContador(cantBoletinesArray[y], y);
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

		var testDate = require('date-utils').language("es");
		//console.log('se inició la funcion para analizr los boletines del 2010 hacia atrás. ');
		var numBoletin = req.param("boletin");
		// el valor del año para este metodo tiene un intervalo cerrado entre 2004 y 2010.
		var year = '2005';

		//El modulo cheerio carga el html de la peticion para desglozar los 
		//elementos por etiquetas; se puede observar los datos por separado con los consol.log();
		request('http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_' + numBoletin + '.htm', function(err, resp, body) {
			//console.log('resp ' + JSON.stringify(resp.statusCode));

			if (!err && resp.statusCode == 200) {
				var $ = cheerio.load(body);
				var fecha = "";
				var fechaCodificada = "";
				//se recueran las etiquetas p del DOM html.
				$('p').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
					//console.log('Texto: ' + JSON.stringify(datos));
					boletinArray.push(datos);
					fechaArray = $(this).find("strong").text();
					////console.log('Fecha:::::::::::::  ' + fechaArray.length);
					if (fechaArray.length > 16 && fecha == '' && fechaArray.length < 40 && fechaArray.search('[0-9]') != -1) // && fecha == '' 
						fecha = fechaArray;
					//console.log('Fecha strong: ' + JSON.stringify(fecha));

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
						//console.log('Fecha STRONG : ' + JSON.stringify(datoFecha));
						fecha = datoFecha;
					});
				}
				//se implementa para sacar la fecha del archivo html.			
				$('span.textopeq').each(function() {
					var datoFecha = $(this).text();
					//console.log('Fecha: ' + JSON.stringify(datoFecha));
					fecha = datoFecha;
				});


				var posTres = fecha.indexOf(",");

				var fechaSinFormato = fecha.slice(posTres + 1);
				var patt1 = /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/g;

				var result = fechaSinFormato.match(patt1);
				//console.log('Result: ' + result);
				//var result2 = result.toLocaleLowerCase();
				var mes = Date.getMonthNumberFromName(result.toString().trim());
				var mesNombre = month[mes];

				var fechaSinMes = fechaSinFormato.replace(result, "");
				var fechaSinCodificacion = mesNombre + ' ' + fechaSinMes;
				fechaSinCodificacion = fechaSinCodificacion.replace(/de/gi, "");

				fechaCodificada = Date.parse(fechaSinCodificacion);

				////console.log('boletinArray[3].: ' + JSON.stringify(boletinArray[3]));
				//console.log('boletin: ' + JSON.stringify(boletin));
				//console.log('Titulo: ' + JSON.stringify(titulo));
				//console.log('TextoCompletoUno: ' + textoCompletoUno);
				//console.log('Texto1y2: ' + textoUnoDos);
				//console.log('Fecha sin codificacion: ' + fechaSinCodificacion);
				//console.log('fechaCodificada: ' + fechaCodificada);

				//funcion para grabar los datos en DB.
				//utils.agregarToDB(boletin, titulo, textoCompletoUno, textoUnoDos, fecha);
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
							//console.log('Texto: ' + texto);
						});
					}


					//parrafos (uno y dos) del texto
					$('p').each(function() {
						var datos = $(this).last().text();
						boletinArray.push(datos);
						console.log('P: ' + datos);
					});
					var textoUnoDos = boletinArray.slice(4, 6).toString();

					//console.log('Texto: ' + texto);

					//titulo
					$('h2.prueba').each(function() {
						//var url =  $(this).attr('href');
						var datos = $(this).last().text(); //encode_utf8
						titulo = decodeURIComponent(datos);
						//console.log('Tituto: ' + titulo);
					});

					//boletin
					$('h3.news-view-subtitle').each(function() {
						//var url =  $(this).attr('href');
						var datos = $(this).last().text().toString();
						boletin = punycode.ucs2.decode(datos);
						//console.log('Boletin: ' + boletin);
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
						//console.log('Result: ' + result);
						//var result2 = result.toLocaleLowerCase();
						var mes = Date.getMonthNumberFromName(result.toString().trim());
						var mesNombre = month[mes];

						var fechaSinMes = fechaSinFormato.replace(result, "");

						fecha = mesNombre + ' ' + fechaSinMes;

					});
					//console.log('FECHAs: ' + fecha);
					//console.log('FECHA UTV: ' + Date.parse(fecha));
					//Método para agregar las variables a la DB.
					//utils.agregarToDB(boletin, titulo, texto, texto, fecha);//.dateParser()( "11/30/2010" )
					boletinArray.length = 0;

				}
			});
		//return res.view('procuraduria');
	}
};