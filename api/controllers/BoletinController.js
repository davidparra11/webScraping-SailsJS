/**
 * BoletinController
 *
 * @description :: Server-side logic for managing boletins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	direccionWeb = 'http://www.procuraduria.gov.co/portal/index.jsp?option=net.comtor.cms.frontend.component.pagefactory.NewsComponentPageFactory&action=view-category&category=13&wpgn=null&max_results=1000&first_result=0',
	dirProcuraduria2010 = 'http://www.procuraduria.gov.co/portal/Noticias-2010.page',
	Regex = require("regex"),
	regex = new Regex(/(a|b)*abb/),
	boletinArray = [],
	boletinArrayHtml = [],
	urls = [],
	cantBoletinesArray = [933, 726, 637, 539, 462, 439, 429],
	yearArray = [2010, 2009, 2008, 2007, 2006, 2005, 2004],
	utils = require('../utlities/Util');

const util = require('util');

var Xray = require('x-ray');
var x = Xray();

var parrafo;

var htmlToText = require('html-to-text');

var parra = [];
//http://www.procuraduria.gov.co/html/noticias_2010/noticias_929.htm

module.exports = {

	/**
	 * método que hace la búsqueda y recopilación a los boletines despúes del 2010 de la procuraduria.
	 */

	find: function(req, res) {

		console.log('find function ');
		request(direccionWeb, function(err, resp, body) {
			console.log('resp ' + JSON.stringify(resp.statusCode));

			if (!err && resp.statusCode == 200) {
				//console.log('body ' + JSON.stringify(body));
				var $ = cheerio.load(body);
				console.log('$ ' + JSON.stringify($)); //#content', '#titulo_zona_noticias', a.title, 

				$('a.news-list-title').each(function() {
					//var url =  $(this).attr('href');
					var url = $(this).text();
					console.log('Texto: ' + JSON.stringify(url));
					/*if(url.indexOf('i.imgur.com')!= -1){
					 urls.push(url);
					 console.log('URLS ' + JSON.stringify(urls));
					 }*/

				});


			}


		});

		return res.view('procuraduria');

	},


	findOld: function(req, res) {

		console.log('entro por find function ');
		//http://stackoverflow.com/questions/22978843/how-to-make-for-loop-wait-until-async-call-was-successful-before-to-continue

		var i = 1;
		var totContador = 120;
		bucleContador(i, totContador);


		function bucleContador(i, totContador) {
			y = 930;
			if (i === undefined)
				i = 1;
			if (i >= totContador) return;



			if (i < 10) {

				year = 2010;
				var dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_00' + i + '.htm';

				//console.log('YEAR: '+ year + ' -i: ' + i);
				//utils.agregarToDB(dirInterna, year, i, y);
				//utils.agregarToDB(dirInterna, year, i, y);
				// var dirBoletProcAntes2010 = 'http://www.procuraduria.gov.co/html/noticias_'+year+'/noticias_933.htm';
				request(dirInterna, function(err, resp, body) {
					//	console.log('resp ' + JSON.stringify(resp.statusCode));

					if (!err && resp.statusCode == 200) {
						//console.log('body ' + JSON.stringify(body));

						var $ = cheerio.load(body);
						//console.log('$ ' + JSON.stringify($)); //#content', '#titulo_zona_noticias', a.title, 

						var fecha = "";



						$('p').each(function() {
							//var url =  $(this).attr('href');
							var datos = $(this).last().text();
							//	console.log('Texto: ' + JSON.stringify(datos));
							boletinArray.push(datos);

						});



						var finalParrafo = boletinArray.length - 1;

						var boletin = boletinArray.slice(0, 1).toString();
						var titulo = boletinArray.slice(1, 2).toString();
						var textoCompletoUno = boletinArray.slice(4, finalParrafo).toString(); //boletinArray.slice(4, 8).toString()

						var textoUnoDos = boletinArray.slice(4, 6).toString();


						//se implementa para sacar la fecha del archivo html.			
						$('span.textopeq').each(function() {
							var datoFecha = $(this).text();
							console.log('Fecha: ' + JSON.stringify(datoFecha));
							fecha = datoFecha;


						});
						console.log('YEAR: ' + year + ' -i: ' + i + ' -y: ' + y);

						console.log('boletin: ' + JSON.stringify(boletin));
						console.log('Titulo: ' + JSON.stringify(titulo));
						//console.log('TextoCompletoUno: ' + textoCompletoUno);
						//console.log('Texto1y2: ' + textoUnoDos);


						var x = {
							titulo: titulo,
							boletin: boletin,
							textoCompleto: textoCompletoUno, //'textoCompleto'   jsonString
							textoUnoDos: textoUnoDos,
							fecha: fecha,
							fuente: 'no aplica'
						};

						boletinArray.length = 0;
						//console.log(x);
						/*Boletin.create(x)
						.exec(function(error, boletin) {
							console.log(boletin);
							if (error) {
								//  utils.showLogs(409, "ERROR", method, controller, 1);
								/*return res.send(409, {
									"message": "Conflict to create boletin",
									"data": error
								});
								console.log('error DB');

							} else {*/
						//   utils.showLogs(200, "OK", method, controller, 0);
						/*return res.send(200, {
							"message": "Create boletin success",
							"data": [{
								id: "boletin.id OK"
							}]
						});
						console.log('OK');
						return true;
					}
				}); */

						//return true;
						i++;
						bucleContador(i, y);


					} else {

						console.log('Hubo un error en la descarga de la página');
						i++;
						bucleContador(i, y);
					}

				});


			} else if (i > 9 && i < 100) {

				//console.log('YEAR: '+ year + 'i: ' + i);
				year = 2010;
				var dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_0' + i + '.htm';
				//utils.agregarToDB(dirInterna, year, i, y);
				// utils.agregarToDB(dirInterna, year, i, y);

				request(dirInterna, function(err, resp, body) {
					//	console.log('resp ' + JSON.stringify(resp.statusCode));

					if (!err && resp.statusCode == 200) {
						//console.log('body ' + JSON.stringify(body));

						var $ = cheerio.load(body);
						//console.log('$ ' + JSON.stringify($)); //#content', '#titulo_zona_noticias', a.title, 

						var fecha = "";



						$('p').each(function() {
							//var url =  $(this).attr('href');
							var datos = $(this).last().text();
							//	console.log('Texto: ' + JSON.stringify(datos));
							boletinArray.push(datos);

						});



						var finalParrafo = boletinArray.length - 1;

						var boletin = boletinArray.slice(0, 1).toString();
						var titulo = boletinArray.slice(1, 2).toString();
						var textoCompletoUno = boletinArray.slice(4, finalParrafo).toString(); //boletinArray.slice(4, 8).toString()

						var textoUnoDos = boletinArray.slice(4, 6).toString();


						//se implementa para sacar la fecha del archivo html.			
						$('span.textopeq').each(function() {
							var datoFecha = $(this).text();
							console.log('Fecha: ' + JSON.stringify(datoFecha));
							fecha = datoFecha;


						});
						console.log('YEAR: ' + year + ' -i: ' + i + ' -y: ' + y);

						console.log('boletin: ' + JSON.stringify(boletin));
						console.log('Titulo: ' + JSON.stringify(titulo));
						//console.log('TextoCompletoUno: ' + textoCompletoUno);
						//console.log('Texto1y2: ' + textoUnoDos);


						var x = {
							titulo: titulo,
							boletin: boletin,
							textoCompleto: textoCompletoUno, //'textoCompleto'   jsonString
							textoUnoDos: textoUnoDos,
							fecha: fecha,
							fuente: 'no aplica'
						};

						boletinArray.length = 0;
						//console.log(x);
						/*Boletin.create(x)
						.exec(function(error, boletin) {
							console.log(boletin);
							if (error) {
								//  utils.showLogs(409, "ERROR", method, controller, 1);
								/*return res.send(409, {
									"message": "Conflict to create boletin",
									"data": error
								});
								console.log('error DB');

							} else {*/
						//   utils.showLogs(200, "OK", method, controller, 0);
						/*return res.send(200, {
							"message": "Create boletin success",
							"data": [{
								id: "boletin.id OK"
							}]
						});
						console.log('OK');
						return true;
					}
				}); */

						//return true;
						i++;
						bucleContador(i, y);


					} else {

						console.log('Hubo un error en la descarga de la página');
						i++;
						bucleContador(i, y);
					}

				});



				/*request(dirInterna, function(err, resp, body) {
					
				});*/
			} else {
				//console.log('YEAR: '+ year + '@i: ' + i);
				year = 2010;
				var dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_' + i + '.htm';
				//utils.agregarToDB(dirInterna, year, i, y);
				//utils.agregarToDB(dirInterna, year, i, y);


				request(dirInterna, function(err, resp, body) {
					//	console.log('resp ' + JSON.stringify(resp.statusCode));

					if (!err && resp.statusCode == 200) {
						//console.log('body ' + JSON.stringify(body));

						var $ = cheerio.load(body);
						//console.log('$ ' + JSON.stringify($)); //#content', '#titulo_zona_noticias', a.title, 

						var fecha = "";



						$('p').each(function() {
							//var url =  $(this).attr('href');
							var datos = $(this).last().text();
							//	console.log('Texto: ' + JSON.stringify(datos));
							boletinArray.push(datos);

						});



						var finalParrafo = boletinArray.length - 1;

						var boletin = boletinArray.slice(0, 1).toString();
						var titulo = boletinArray.slice(1, 2).toString();
						var textoCompletoUno = boletinArray.slice(4, finalParrafo).toString(); //boletinArray.slice(4, 8).toString()

						var textoUnoDos = boletinArray.slice(4, 6).toString();


						//se implementa para sacar la fecha del archivo html.			
						$('span.textopeq').each(function() {
							var datoFecha = $(this).text();
							console.log('Fecha: ' + JSON.stringify(datoFecha));
							fecha = datoFecha;


						});
						console.log('YEAR: ' + year + ' -i: ' + i + ' -y: ' + y);

						console.log('boletin: ' + JSON.stringify(boletin));
						console.log('Titulo: ' + JSON.stringify(titulo));
						//console.log('TextoCompletoUno: ' + textoCompletoUno);
						//console.log('Texto1y2: ' + textoUnoDos);


						var x = {
							titulo: titulo,
							boletin: boletin,
							textoCompleto: textoCompletoUno, //'textoCompleto'   jsonString
							textoUnoDos: textoUnoDos,
							fecha: fecha,
							fuente: 'no aplica'
						};

						boletinArray.length = 0;
						//console.log(x);
						/*Boletin.create(x)
						.exec(function(error, boletin) {
							console.log(boletin);
							if (error) {
								//  utils.showLogs(409, "ERROR", method, controller, 1);
								/*return res.send(409, {
									"message": "Conflict to create boletin",
									"data": error
								});
								console.log('error DB');

							} else {*/
						//   utils.showLogs(200, "OK", method, controller, 0);
						/*return res.send(200, {
							"message": "Create boletin success",
							"data": [{
								id: "boletin.id OK"
							}]
						});
						console.log('OK');
						return true;
					}
				}); */

						//return true;
						i++;
						bucleContador(i, y);


					} else {

						console.log('Hubo un error en la descarga de la página');
						i++;
						bucleContador(i, y);
					}

				});


				/*request(dirInterna, function(err, resp, body) {
					
				});*/
			}

		}



		/*http://www.procuraduria.gov.co/portal/Noticias-2004.page
http://www.procuraduria.gov.co/portal/Noticias-2005.page
http://www.procuraduria.gov.co/portal/Noticias-2006.page

http://www.procuraduria.gov.co/html/noticias_2010/noticias_933.htm*/



		//return res.view('procuraduria2010');


	},


	individual: function(req, res) {

		console.log('find function ');
		request('http://www.procuraduria.gov.co/html/noticias_2010/noticias_821.htm', function(err, resp, body) {
			console.log('resp ' + JSON.stringify(resp.statusCode));

			if (!err && resp.statusCode == 200) {
				//console.log('body ' + JSON.stringify(body));

				var $ = cheerio.load(body);
				//console.log('$ ' + JSON.stringify($)); //#content', '#titulo_zona_noticias', a.title, 

				var fecha = "";



				$('p').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
					console.log('Texto: ' + JSON.stringify(datos));
					boletinArray.push(datos);

				});



				var finalParrafo = boletinArray.length - 1;

				var boletin = boletinArray.slice(0, 1).toString();
				var titulo = boletinArray.slice(1, 2).toString();
				var textoCompletoUno = boletinArray.slice(4, finalParrafo).toString(); //boletinArray.slice(4, 8).toString()

				var textoUnoDos = boletinArray.slice(4, 6).toString();


				//se implementa para sacar la fecha del archivo html.			
				$('span.textopeq').each(function() {
					var datoFecha = $(this).text();
					console.log('Fecha: ' + JSON.stringify(datoFecha));
					fecha = datoFecha;


				});


				console.log('boletin: ' + JSON.stringify(boletin));
				console.log('Titulo: ' + JSON.stringify(titulo));
				console.log('TextoCompletoUno: ' + textoCompletoUno);
				console.log('Texto1y2: ' + textoUnoDos);


				/*	var x = {
						titulo: titulo,
						boletin: boletin,
						textoCompleto: textoCompletoUno, //'textoCompleto'   jsonString
						textoUnoDos: textoUnoDos,
						fecha: fecha,
						fuente: 'no aplica'
					};
					//console.log(x);
					Boletin.create(x)
					.exec(function(error, boletin) {
						console.log(boletin);
						if (error) {
							//  utils.showLogs(409, "ERROR", method, controller, 1);
							return res.send(409, {
								"message": "Conflict to create boletin",
								"data": error
							});
						} else {
							//   utils.showLogs(200, "OK", method, controller, 0);
							return res.send(200, {
								"message": "Create boletin success",
								"data": [{
									id: "boletin.id OK"
								}]
							});
						}
					}); */

			}

		});

		//return res.view('procuraduria');

	}
};