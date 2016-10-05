//"use strict"; //utils
var request = require('request'),
	cheerio = require('cheerio'),
	boletinArray = [],
	boletinArrayHtml = [],
	urls = [];

module.exports = {
	descargar: function(direccion, year, i, y) {

	},

	agregarToDB: function(boletin, titulo, textoCompletoUno, textoUnoDos, fecha, fuente, urlWeb, localPdf, localHtml, infoBoletin) {

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
					console.log('error DB; boletin: ' + infoBoletin);
					return true;
				} else {
					console.log('OK, DB');
					return true;
				}
			}); /**/

		//return true;       
	},

	addPersonasToDB: function(nombre, correo, telefono, formacionAcademica, infoBoletin) {

		var x = {
			nombre: nombre,
			correo: correo,
			telefono: telefono,
			otro: formacionAcademica
		};		
		Personas.create(x)
			.exec(function(error, persona) {
				//console.log(boletin);
				if (error) {
					console.log('error DB con: ' + infoBoletin);
					return true;
				} else {
					console.log('OK, DB.');
					return true;
				}
			}); /**/

		//return true;  
	}

}