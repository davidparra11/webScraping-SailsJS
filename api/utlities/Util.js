//"use strict"; //utils
var request = require('request'),
	cheerio = require('cheerio'),
	boletinArray = [],
	boletinArrayHtml = [],
	urls = [];

module.exports = {
	descargar: function(direccion, year, i, y) {

	},

	agregarToDB: function(boletin, titulo, textoCompletoUno, textoUnoDos, fecha, fuente, urlWeb, localPdf, localHtml) {

		var x = {
			titulo: titulo,
			boletin: boletin,
			textoCompleto: textoCompletoUno,
			textoUnoDos: textoUnoDos,
			fecha: fecha,
			fuente: fuente,
			urlWeb: urlWeb,
			localPdf: localPdf,
			localHtml: localHtml
		};

		boletinArray.length = 0;
		//console.log(x);
		Boletin.create(x)
			.exec(function(error, boletin) {
				//console.log(boletin);
				if (error) {
					console.log('error DB');
					return true;
				} else {
					console.log('OK');
					return true;
				}
			}); /**/

		//return true;       
	}

}