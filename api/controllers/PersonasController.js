/**
 * PersonasController
 *
 * @description :: Server-side logic for managing Personas
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	direccionWeb = 'http://www.procuraduria.gov.co/portal/index.jsp?option=net.comtor.cms.frontend.component.pagefactory.NewsComponentPageFactory&action=view-category&category=11&wpgn=null&max_results=1000&first_result=0',
	dirProcuraduria2010 = 'http://www.procuraduria.gov.co/portal/Noticias-2010.page',
	Regex = require("regex"),
	regex = new Regex(/(a|b)*abb/),
	boletinArray = [],
	boletinArrayHtml = [],
	urls = [],
	cantBoletinesArray = [933, 726, 637, 539, 462, 439, 429],
	yearArray = [2010, 2009, 2008, 2007, 2006, 2005, 2004],
	onceArray = [8, 9, 10, 11, 12, 13],
	i = 1,
	year = 2010,
	dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + year + '/noticias_00' + i + '.htm',
	linksArray = [],
	utils = require('../utlities/Util');

const util = require('util');

var Xray = require('x-ray');
var x = Xray();

var parrafo;

var htmlToText = require('html-to-text');

var parra = [];
//http://www.procuraduria.gov.co/html/noticias_2010/noticias_929.htm

module.exports = {
	find: function(req, res) {

		console.log('Recurso para tomar datos del 2011 hacia adelante.');

		// for(var i in allImgs){

		// }

		
		request(direccionWeb, function(err, resp, body) {
			console.log('resp ' + JSON.stringify(resp.statusCode));

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

				$('a.news-list-title').each(function() {
					//var url =  $(this).attr('href');
					var url = $(this).attr('href');
					//console.log('Texto: ' + JSON.stringify(url));
					/*if(url.indexOf('i.imgur.com')!= -1){
					 urls.push(url);
					 console.log('URLS ' + JSON.stringify(urls));
					 }*/
					if (url !== undefined)
						linksArray.push(url);
				});
			} //console.log(linksArray);//return

			for (var llaveLink in linksArray) {
				request('http://www.procuraduria.gov.co/portal/' + linksArray[llaveLink], function(err, resp, body) {
					//console.log('resp ' + JSON.stringify(resp.statusCode));

					if (!err && resp.statusCode == 200) {
						//console.log('body ' + JSON.stringify(body));

						var $ = cheerio.load(body);
						//console.log('$ ' + JSON.stringify($)); //#content', '#titulo_zona_noticias', a.title, 

						var fecha = "";

						//texto
						$('p.MsoNormal').each(function() {
							//var url =  $(this).attr('href');
							var datos = $(this).last().text();
							console.log('Texto: ' + JSON.stringify(datos));
							//boletinArray.push(datos);

						});
						//titulo
						$('h2.prueba').each(function() {
							//var url =  $(this).attr('href');
							var datos = $(this).last().text();
							//+ console.log('Tituto: ' + JSON.stringify(datos));
							//boletinArray.push(datos);

						});

						//boletin

						$('h3.news-view-subtitle').each(function() {
							//var url =  $(this).attr('href');
							var datos = $(this).last().text();
							//	console.log('Boletin: ' + JSON.stringify(datos));
							//	boletinArray.push(datos);

						});

						//fecha

						$('h4').each(function() {
							//var url =  $(this).attr('href');
							var datos = $(this).last().text();
							//	console.log('Fecha: ' + JSON.stringify(datos));
							//boletinArray.push(datos);

						});

						//utils.agregarToDB(boletin, titulo, textoCompletoUno, textoUnoDos, fecha);*/

						boletinArray.length = 0;

					} else {
						console.log('hubo problemas con: ' + linksArray[llaveLink])
						return true;
					}

				});
			}
		});
		return res.view('procuraduria');

	},
	
};

