/**
 * ProcuraduriaController
 *
 * @description :: Server-side logic for managing boletins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	iconv = require('iconv-lite'),
	moment = require('moment'),
	utils = require('../utlities/Util'),
	dbManager = require('../utlities/dbManager');


var dirProcuraduria2010 = 'http://www.procuraduria.gov.co/portal/Noticias-2010.page',
	boletinArray = [],
	cantBoletinesArray = [22, 23, 24, 25, 26, 27, 28],
	yearArray = [2010, 2009, 2008, 2007, 2006, 2005, 2004],
	onceArray = [8, 9, 10, 11, 12, 13],
	onceYearArray = [2011, 2012, 2013, 2014, 2015, 2016],
	i = 1,
	year = 2010,
	linksArray = [],
	y = 0,
	now = moment();

var consecCodigo = 0;
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
//Módulos que se van hacer públicos
module.exports = {
	/**
	  Descripción: método que hace la búsqueda y recopilación a los boletines del 2011 y años posteriores de la procuraduria y
	  guarda los datos importantes en la BD.
	  req: Request
	  res: Response
	 */
	boletinesNuevos: function(req, res) {

		console.log('Recurso para tomar datos de todos (' + process.env.NUM_RESULT_PROCU_NUEVOS + ')los boletines del 2011 hacia adelante.');

		contador = 1;
		boletinesNuevosError = [];
		//variable de entorno para mejorar la selecion en el ambiente de desarrollo.
		//selecciona el numero de resultados del paginador de la procuraduria para cada año.
		var numeroResultados = process.env.NUM_RESULT_PROCU_NUEVOS;

		var numeroResultados;
		try {
			numeroResultados = process.env.NUM_RESULT_PROCU_NUEVOS;
		} catch (e) {
			console.error('variable no definida: ' + e);
			return;
		}

		for (var key in onceArray) {
			var direccionWeb = 'http://www.procuraduria.gov.co/portal/index.jsp?option=net.comtor.cms.frontend.component.pagefactory.NewsComponentPageFactory&action=view-category&category=' + onceArray[key] + '&wpgn=null&max_results=' + numeroResultados + '&first_result=0';
			request(direccionWeb, function(err, resp, body) {
				if (!err && resp.statusCode == 200) {
					var $ = cheerio.load(body);
					$('a.news-list-title').each(function() {
						var url = $(this).attr('href');
						if (url === undefined)
							return;

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
									var boletin = "";
									var titulo = "";
									var fuente = "";
									var yearBoletin = "";

									//texto
									var texto = $('p.MsoNormal').text().trim();

									if (texto === undefined || texto == "") {
										$('div[align=justify]').each(function() {
											var datos = $(this).last().text();
											texto = datos.trim();
										});
									}

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
										//var result2 = result.toLocaleLowerCase();
										var mes = Date.getMonthNumberFromName(result.toString().trim());
										var mesNombre = month[mes];
										var fechaSinMes = fechaSinFormato.replace(result, "");
										fecha = mesNombre + ' ' + fechaSinMes;

										var patt2 = /(2011|2012|2013|2014|2015|2016)/g;
										yearBoletin = fechaSinFormato.match(patt2);
									});

									var boletinSinEspacios = boletin.replace(/ /g, "_");
									//console.log('Boletin: ' + boletin + 'Año: ' + yearBoletin);

									var fechaSinCodificacion = fecha;
									//fechaSinCodificacion = fechaSinCodificacion.replace(/de/gi, "");
									fechaCodificada = Date.parse(fechaSinCodificacion);

									dirWeb = 'http://www.procuraduria.gov.co/portal/' + url;

									dirLocalHtml = './htmlBoletines/' + yearBoletin + '_' + boletinSinEspacios + '.html';
									var infoBoletin = 'Boletin: ' + boletinSinEspacios;
									//agregar datos de las variables a la base de datos.
									utils.agregarToDB(boletin, titulo, texto, textoUnoDos, fechaCodificada, 'Procuraduria', dirWeb, '', dirLocalHtml, infoBoletin);

									request('http://www.procuraduria.gov.co/portal/' + url).pipe(fs.createWriteStream('./htmlBoletines/' + yearBoletin + '_' + boletinSinEspacios + '.html'));
									boletinArray.length = 0;
								} else {
									console.log('hubo problemas con: ' + url);
									boletinesNuevosError.push(url);
									console.log('boletines con problemas (direccion: ' + boletinesNuevosError);
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
	  Descripción: método que hace la búsqueda y recopilación a los boletines del 2010 y años anteriores de la procuraduría.
	  req: Request
	  res: Response
	 */
	boletinesAntiguos: function(req, res) {

		console.log('Recurso para tomar datos de todos los boletines del 2010 hacia atrás...');
		// numero exacto de boletines por año.
		//var cantBoletinesArray = [933, 726, 637, 539, 462, 439, 429]; 
		// arry de prueba para los boletines.
		var cantBoletinesArray = [22, 23, 24, 25, 26, 27, 28];

		var boletinesFalsos = [];

		try {
			bucleContador(cantBoletinesArray[y], y);
		} catch (e) {
			console.log('Error: ' + e);
		} finally {
			//return res.view('procuraduria2010');			
		}

		function bucleContador(totContador, llave) {
			if (y > 6) {
				return true;
			}
			if (i === undefined)
				i = 1;
			if (i >= totContador) {
				i = 0;
				y++;
				bucleContador(cantBoletinesArray[y], y);
			}
			i++;
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

					var fechaCodificada = '';
					var fecha = '';

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
					//var textoUnoDos = boletinArray.slice(4, 6).toString();
					var textoUnoDos = '';

					//numero boletin
					if (boletin.length == 31) {
						boletin = boletin.slice(20);
					} else if (boletinArray[1].toString().length == 31) {
						boletin = boletinArray[1].toString().slice(20);
					} else {
						$('td.marcogris2').each(function() {
							var datoBoletin = $(this).text();
							boletin = datoBoletin.slice(20);
						});
					}
					//titulo
					if (titulo.length > 33 && boletinArray[0].toString().length == 31) {
						titulo = titulo.trim();
					} else if (boletinArray[0].length > 31) {
						titulo = boletinArray[0].toString().trim();
					} else {
						titulo = boletinArray[1].toString();
						if (boletinArray[1].toString().length < 15)
							titulo = 'COMUNICADO DE PRENSA';
					}

					//bloque para filtrar todo el texto completo del boletín.
					if (boletinArray[1].toString().length > 99) {
						var textoCompletoUnoAnterior = boletinArray.slice(1, finalParrafo);
						textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
						textoUnoDos = boletinArray.slice(1, 3).toString().trim();

					} else if (boletinArray[2].toString().length > 99) {
						var textoCompletoUnoAnterior = boletinArray.slice(2, finalParrafo);
						textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
						textoUnoDos = boletinArray.slice(2, 4).toString().trim();

					} else {
						var textoCompletoUnoAnterior = boletinArray.slice(3, finalParrafo);
						textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
						textoUnoDos = boletinArray.slice(3, 5).toString().trim();
						if (boletinArray[2].toString().length < 99)
							var textoCompletoUnoAnterior = boletinArray.slice(4, finalParrafo);
						textoUnoDos = boletinArray.slice(3, 5).toString().trim();
						textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
					}

					if (textoCompletoUno == '') {
						var textoCompletoUnoAnterior = boletinArray.slice(0, finalParrafo);
						textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
						textoUnoDos = boletinArray.slice(0, 2).toString().trim();
					}

					//fecha 
					if (fecha == '') {
						$('strong').each(function() {
							var datoFecha = $(this).text();
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
					//var result2 = result.toLocaleLowerCase();
					if (result === null)
						result = 'enero';

					var mes = Date.getMonthNumberFromName(result.toString().trim());
					var mesNombre = month[mes];

					var fechaSinMes = fechaSinFormato.replace(result, "");
					var fechaSinCodificacion = mesNombre + ' ' + fechaSinMes;
					fechaSinCodificacion = fechaSinCodificacion.replace(/de/gi, "");

					fechaCodificada = Date.parse(fechaSinCodificacion);

					dirLocalHtml = './htmlBoletines/' + yearArray[llave] + '_' + boletinSinEspacios + '.html';
					var infoBoletin = 'año: ' + yearArray[llave] + 'boletin ' + boletinSinEspacios + '.' + i;

					//agregar datos de las variables a la base de datos.
					utils.agregarToDB(boletin, titulo, textoCompletoUno, textoUnoDos, fechaCodificada, 'Procuraduria', dirInterna, '', dirLocalHtml, infoBoletin);
					//crea los archivos HTML de los boletines analizados.
					request(dirInterna).pipe(fs.createWriteStream('./htmlBoletines/' + yearArray[llave] + '_' + boletinSinEspacios + '.html'));
					boletinArray.length = 0;
				} else {
					console.log('Hubo un error en la descarga de la página: - ' + dirInterna + ' -i: ' + i);
					//boletinesFalsos.push(i);
				}
			});
			bucleContador(cantBoletinesArray[y], y);
		}
		console.log("Boletines Falsos" + boletinesFalsos);
		return res.view('procuraduria2010');
	},

	/**
	 * Analiza un boteletin en específico solo para los años 2010 y anteriores.
	 */
	individual: function(req, res) {

		if (!req.param("boletin")) {
			return res.send(400, "el valor de 'boletin' no se ha introducido.");
		}

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
					var datos = $(this).last().text();
					boletinArray.push(datos);
					fechaArray = $(this).find("strong").text();
					if (fechaArray.length > 16 && fecha == '' && fechaArray.length < 40 && fechaArray.search('[0-9]') != -1) // && fecha == '' 
						fecha = fechaArray;
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
				//var result2 = result.toLocaleLowerCase();
				var mes = Date.getMonthNumberFromName(result.toString().trim());
				var mesNombre = month[mes];
				var fechaSinMes = fechaSinFormato.replace(result, "");
				var fechaSinCodificacion = mesNombre + ' ' + fechaSinMes;
				fechaSinCodificacion = fechaSinCodificacion.replace(/de/gi, "");
				fechaCodificada = Date.parse(fechaSinCodificacion);
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

					texto = $('p.MsoNormal').text();



					console.log('Texto: ' + texto);

					if (texto === undefined || texto == "") {
						$('div[align=justify]').each(function() {
							var datos = $(this).last().text();
							texto = datos;
							console.log('Texto Alternativo: ' + datos);
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
						var datos = $(this).last().text(); //encode_utf8
						titulo = decodeURIComponent(datos);
					});

					//boletin
					$('h3.news-view-subtitle').each(function() {
						var datos = $(this).last().text().toString();
						boletin = datos;
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
						//var result2 = result.toLocaleLowerCase();
						var mes = Date.getMonthNumberFromName(result.toString().trim());
						var mesNombre = month[mes];
						var fechaSinMes = fechaSinFormato.replace(result, "");
						fecha = mesNombre + ' ' + fechaSinMes;
					});
					boletinArray.length = 0;

				}
			});
		//return res.view('procuraduria');
	},

	descargaBol2: function(req, res) {

		console.log('Recurso para tomar datos de todos (' + process.env.NUM_RESULT_PROCU_NUEVOS + ')los boletines del 2011 hacia adelante.');

		contador = 1;
		boletinesNuevosError = [];
		//variable de entorno para mejorar la selecion en el ambiente de desarrollo.
		//selecciona el numero de resultados del paginador de la procuraduria para cada año.
		var numeroResultados = process.env.NUM_RESULT_PROCU_NUEVOS;

		var numeroResultados;
		try {
			numeroResultados = process.env.NUM_RESULT_PROCU_NUEVOS;
		} catch (e) {
			console.error('variable no definida: ' + e);
			return;
		}
		for (var key in onceArray) {
			interpretaBoletin(key, onceArray, numeroResultados);
		}
	},

	descargaBolAnti2: function(req, res) {

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

	}
}



/*
  Descripción: Interpreta un archivo html
  root: ruta local del archivo
  stat: status de la lectura del archivo con atributos básicos
  next: callback al siguiente archivo
 */
function interpretaBoletin(key, onceArray, numeroResultados) {
	var direccionWeb = 'http://www.procuraduria.gov.co/portal/index.jsp?option=net.comtor.cms.frontend.component.pagefactory.NewsComponentPageFactory&action=view-category&category=' + onceArray[key] + '&wpgn=null&max_results=' + numeroResultados + '&first_result=0';
	try {
		request(direccionWeb, function(err, resp, body) {
			if (!err && resp.statusCode == 200) {
				//Carga el archivo en operador $
				var $ = cheerio.load(body);
				$('a.news-list-title').each(function() {
					var url = $(this).attr('href');
					if (url === undefined)
						return;
					//var nombreUno = $(this).text().toString();
					utils.sleep(500);
					var url = 'http://www.procuraduria.gov.co/portal/' + url;
					var cuerpo = escribirArchivoHtml(url);
				});
			} else {
				utils.registrarError(error, urla);
			}
		})
	} catch (e) {
		utils.registrarError(e, urla);
	}



}


/*
  Descripción: Escribe un archivo html en el disco
  nombreUno: Nombre completo del archivo con caracteres especiales
  urla : url del archivo remoto
 */
function escribirArchivoHtml(urla) {
	//+var nombreSinEspacios = utils.eliminarCaracteresEspeciales(nombreUno, true);
	//+var ruta = '/htmlBoletines/' + nombreSinEspacios + '.html';
	try {
		//var writeStream = fs.createWriteStream('.' + ruta);
		request(urla, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var dataBd = extraerBolBd(body, urla);
				//+console.log(archivoActual + ' de ' + totalBusqueda);
				dbManager.agregarBoletinToDB(dataBd);
			} else {
				utils.registrarError(error, urla);
			}
		});
	} catch (e) {
		utils.registrarError(e, urla);
	}
}

/*
  Descripción: Extrae los valores de los boletínes requeridos por la base de datos
  err: Mensaje de error retornado por el request
  resp: Código respuesta del request
  body: Contenido de la respuesta del request
  urlb : url del archivo remoto
 */
function extraerBolBd(cuerpo, url) {
	var bodyWithCorrectEncoding = iconv.decode(cuerpo, 'iso-8859-1');
	var $ = cheerio.load(bodyWithCorrectEncoding);
	var textoUno = "";
	var fecha = "";
	var fuente = "";
	var yearBoletin = "";

	//texto boletín
	var texto = $('p.MsoNormal').text().trim().toUpperCase();
	var posParrafo = texto.indexOf(".");
	var textoUnoDos = texto.slice(0, posParrafo).toUpperCase();

	if (texto === undefined || texto == "") {
		$('div[align=justify]').each(function() {
			var datos = $(this).last().text();
			texto = datos.trim().toUpperCase();
			var posParrafo = texto.indexOf(".");
			var textoUnoDos = texto.slice(0, posParrafo).toUpperCase();
		});
	}


	//titulo boletín
	var titulo = $('h2.prueba').text().trim().toUpperCase();

	//boletin  boletín
	var boletin = $('h3.news-view-subtitle').text().trim().toUpperCase();

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
		//var result2 = result.toLocaleLowerCase();
		var mes = Date.getMonthNumberFromName(result.toString().trim());
		var mesNombre = month[mes];
		var fechaSinMes = fechaSinFormato.replace(result, "");
		fecha = mesNombre + ' ' + fechaSinMes;

		var patt2 = /(2011|2012|2013|2014|2015|2016)/g;
		yearBoletin = fechaSinFormato.match(patt2);
	});

	var boletinSinEspacios = boletin.replace(/ /g, "_");
	var fechaSinCodificacion = fecha;
	fechaCodificada = Date.parse(fechaSinCodificacion);

	dirWeb = 'http://www.procuraduria.gov.co/portal/' + url;

	dirLocalHtml = './htmlBoletines/' + yearBoletin + '_' + boletinSinEspacios + '.html';
	var infoBoletin = 'Boletin: ' + boletinSinEspacios;


	//Relacionado con
	var relacionadoConDefault = 'PROCURADURIA: DIRECTORIO DE BOLETINES ';
	var relacionadoCon = relacionadoConDefault + ', ' + boletin + ': ' + titulo + '. ' + textoUnoDos;

	request('http://www.procuraduria.gov.co/portal/' + url).pipe(fs.createWriteStream('./htmlBoletines/' + yearBoletin + '_' + boletinSinEspacios + '.html'));

	//IngresaLista
	var fecha = utils.fechaHoy();
	var ingresaLista = 'INGRESA_LISTA: ' + fecha;
	consecCodigo++;
	//Retornamos un json con los valores que debe recibir la base de datos
	return {
		CODIGO: 'TMP_' + consecCodigo,
		RELACIONADO_CON: utils.eliminarCaracteresEspeciales(relacionadoCon, false),
		ROL_O_DESCRIPCION1: utils.eliminarCaracteresEspeciales(texto, false),
		FECHA_UPDATE: utils.eliminarCaracteresEspeciales(fecha, false),
		ESTADO: utils.eliminarCaracteresEspeciales(ingresaLista, false),
	};
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

	try {
		request(dirInterna, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var dataBd = extraerBolAntiguoBd(body, dirInterna);
				//+console.log(archivoActual + ' de ' + totalBusqueda);
				dbManager.agregarBoletinToDB(dataBd);
			} else {
				utils.registrarError(error, dirInterna);
			}
		});
	} catch (e) {
		utils.registrarError(e, dirInterna);
	}
	bucleContador(cantBoletinesArray[y], y);
}


/*
  Descripción: Extrae los valores de los boletínes requeridos por la base de datos
  err: Mensaje de error retornado por el request
  resp: Código respuesta del request
  body: Contenido de la respuesta del request
  urlb : url del archivo remoto
 */
function extraerBolAntiguoBd(cuerpo, url) {

	var $ = cheerio.load(cuerpo);

	var fechaCodificada = '';
	var fecha = '';

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
	var textoUnoDos = '';

	//numero boletin
	if (boletin.length == 31) {
		boletin = boletin.slice(20);
	} else if (boletinArray[1].toString().length == 31) {
		boletin = boletinArray[1].toString().slice(20);
	} else {
		$('td.marcogris2').each(function() {
			var datoBoletin = $(this).text();
			boletin = datoBoletin.slice(20);
		});
	}
	//titulo
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
	//bloque para filtrar todo el texto completo del boletín.
	if (boletinArray[1].toString().length > 99) {
		var textoCompletoUnoAnterior = boletinArray.slice(1, finalParrafo);
		textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
		textoUnoDos = boletinArray.slice(1, 3).toString().trim();

	} else if (boletinArray[2].toString().length > 99) {
		var textoCompletoUnoAnterior = boletinArray.slice(2, finalParrafo);
		textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
		textoUnoDos = boletinArray.slice(2, 4).toString().trim();

	} else {
		var textoCompletoUnoAnterior = boletinArray.slice(3, finalParrafo);
		textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
		textoUnoDos = boletinArray.slice(3, 5).toString().trim();
		if (boletinArray[2].toString().length < 99)
			var textoCompletoUnoAnterior = boletinArray.slice(4, finalParrafo);
		textoUnoDos = boletinArray.slice(3, 5).toString().trim();
		textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
	}

	if (textoCompletoUno == '') {
		var textoCompletoUnoAnterior = boletinArray.slice(0, finalParrafo);
		textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
		textoUnoDos = boletinArray.slice(0, 2).toString().trim();
	}
	var boletinSinEspacios = boletin.replace(/ /g, "_");

	//crea los archivos HTML de los boletines analizados.
	//request(dirInterna).pipe(fs.createWriteStream('./htmlBoletines/' + yearArray[llave] + '_' + boletinSinEspacios + '.html'));
	boletinArray.length = 0;



	//Relacionado con
	var relacionadoConDefault = 'PROCURADURIA: DIRECTORIO DE BOLETINES ';
	var relacionadoCon = relacionadoConDefault + ', ' + boletin + ': ' + titulo + '. ' + textoUnoDos;

	//IngresaLista
	var fecha = utils.fechaHoy();
	var ingresaLista = 'INGRESA_LISTA: ' + fecha;
	consecCodigo++;
	//Retornamos un json con los valores que debe recibir la base de datos
	return {
		CODIGO: 'TMP_' + consecCodigo,
		RELACIONADO_CON: utils.eliminarCaracteresEspeciales(relacionadoCon, false),
		ROL_O_DESCRIPCION1: utils.eliminarCaracteresEspeciales(textoCompletoUno, false),
		FECHA_UPDATE: utils.eliminarCaracteresEspeciales(fecha, false),
		ESTADO: utils.eliminarCaracteresEspeciales(ingresaLista, false),
	};
}