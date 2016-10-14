/**
 * LinksController
 *
 * @description :: Server-side logic for managing links
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
	linksArray = [],
	nombreArray = [],
	personaArray = [],
	formacionArray = [],
	nacimientoArray = [],
	util = require('util'),
	utils = require('../utlities/Util');

var walk = require('walk');
var filesArray = [];
var linkPersonasArray = [];

//http://www.procuraduria.gov.co/html/noticias_2010/noticias_929.htm

module.exports = {

	/**
	 * método que recupera las HVs de los contratistas, los pasa a HTML y guarda datos importantes en DB.
	 */
	numeroLinks: function(req, res) {

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
					//var writeStream = fs.createWriteStream('./htmls/' + nombreSinEspacios + '.html');
					utils.addLinksToDB(url, url);
					//.pipe(writeStream);//

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



	}
};

