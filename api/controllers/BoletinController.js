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
	i = 1,
	year = 2010,
	dirInterna = 'http://www.procuraduria.gov.co/html/noticias_'+year+'/noticias_00' + i + '.htm',
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

		console.log('Recurso para tomar datos del 2010 hacia atrás ');

		var boletinesFalsos = [];

		var i =330;
		var totContador = 920;
		//bucleContador(i, totContador);
		year = 2010;
		

		bucleContador(i, totContador);

		function bucleContador(i, totContador) {
			y = 920;
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
							if (fechaArray.length > 16 && fecha == ''  && fechaArray.length < 40 && fechaArray.search('[0-9]') != -1) // && fecha == '' 
								fecha = fechaArray;

						});

						//se implementa para sacar la fecha del archivo html.			
						/**/$('span.textopeq').each(function() {
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

						if (boletin.length == 31){
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

						if (titulo.length > 33 && boletinArray[0].toString().length == 31){
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
						if (boletinArray[1].toString().length > 99){
							textoCompletoUno = boletinArray.slice(1, finalParrafo);
							
						} else if (boletinArray[2].toString().length > 99) {
							textoCompletoUno = boletinArray.slice(2, finalParrafo);
							
						} else {
							textoCompletoUno = boletinArray.slice(3, finalParrafo);
							if (boletinArray[2].toString().length < 99)
								textoCompletoUno = boletinArray.slice(4, finalParrafo);

						}

						if (fecha == ''){

							//var inicioFecha = textoCompletoUno.toString().indexOf(",");//indexOf es mas rapido. que search func.

							var finalFecha = textoCompletoUno.toString().search(":");

							//console.log('FechaInicial:::::::::::::  ' + inicioFecha);

						//*	console.log('Final:::::::::::::  ' + finalFecha);

							fecha = textoCompletoUno.toString().slice(0, 30);

						}
				

					/*	var inicioFecha = textoCompletoUno.toString().indexOf(",");//indexOf es mas rapido. que search func.

							var finalFecha = textoCompletoUno.toString().indexOf('.');

							console.log('FechaInicial:::::::::::::  ' + inicioFecha);

							console.log('Final:::::::::::::  ' + finalFecha);
*/
							//fecha = textoCompletoUno.slice(10, finalFecha).toString();




						/*if (boletin.length == 31)
							boletin = boletin;


						if (boletinArray.slice(1, 2).toString().length == 31)
							boletin = boletin;

						if (boletinArray.slice(2, 3).toString().length == 31)
							boletin = boletin;*/

						
						console.log('YEAR: ' + year + ' -i: ' + i + ' -y: ' + y);
						console.log('Boletin: ' + JSON.stringify(boletin));
						//+console.log('Titulo: ' + JSON.stringify(titulo));
						//console.log('TextoCompletoUno: ' + textoCompletoUno);
						//console.log('Fecha:::::::::::::  ' + fecha);
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

							year = 2010;
						    dirInterna = 'http://www.procuraduria.gov.co/html/noticias_'+year+'/noticias_00' + i + '.htm';

						    bucleContador(i, y);						

						} else if (i > 9 && i < 100) {
							//console.log('YEAR: '+ year + 'i: ' + i);
							year = 2010;
						    dirInterna = 'http://www.procuraduria.gov.co/html/noticias_'+year+'/noticias_0' + i + '.htm';

						    bucleContador(i, y);
						    
						} else {
							//console.log('YEAR: '+ year + '@i: ' + i);
							year = 2010;
						    dirInterna = 'http://www.procuraduria.gov.co/html/noticias_'+year+'/noticias_' + i + '.htm';
						    bucleContador(i, y);						    
						}
					
					} else {
						console.log('Hubo un error en la descarga de la página' + dirInterna + ' -i: ' + i);
						dirInterna = 'http://www.procuraduria.gov.co/html/noticias_'+year+'/noticias_' + i + '.htm';
						i++;
						bucleContador(i, y);
					}

				});
				/*request(dirInterna, function(err, resp, body) {
					
				});*/console.log('Boletines Falsos' + JSON.stringify(boletinesFalsos));
			}

			console.log("Boletines Falsos" + boletinesFalsos);
			return res.view('procuraduria2010');

			


		



		/*http://www.procuraduria.gov.co/portal/Noticias-2004.page
http://www.procuraduria.gov.co/portal/Noticias-2005.page
http://www.procuraduria.gov.co/portal/Noticias-2006.page

http://www.procuraduria.gov.co/html/noticias_2010/noticias_933.htm*/



		//return res.view('procuraduria2010');


	},


	individual: function(req, res) {

		var numBoletin = req.param("boletin");

		console.log('find function ');
		request('http://www.procuraduria.gov.co/html/noticias_2010/noticias_' + numBoletin +'.htm', function(err, resp, body) {
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

				console.log('boletinArray[3].: ' + JSON.stringify(boletinArray[3]));
				console.log('boletin: ' + JSON.stringify(boletin));
				console.log('Titulo: ' + JSON.stringify(titulo));
				console.log('TextoCompletoUno: ' + textoCompletoUno);
				console.log('Texto1y2: ' + textoUnoDos);

				console.log('Long boletin: ' + JSON.stringify(boletin.length));
				console.log('Long Titulo: ' + JSON.stringify(titulo.length));
				console.log('Long TextoCompletoUno: ' + textoCompletoUno.length);
				console.log('Long Texto1y2: ' + textoUnoDos.length);

				utils.agregarToDB(boletin, titulo, textoCompletoUno, textoUnoDos, fecha);

					boletinArray.length = 0;

			}

		});

		//return res.view('procuraduria');

	}
};