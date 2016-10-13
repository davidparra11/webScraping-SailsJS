//"use strict"; //utils
var request = require('request'),
	cheerio = require('cheerio');

module.exports = {
	fechaHoy: function(){
		var fechaHoy = new Date();

		var dia = ("0" + fechaHoy.getDate()).slice(-2);
		var mes = ("0" + (fechaHoy.getMonth() + 1)).slice(-2);
		var anio = fechaHoy.getFullYear();

		return anio + '' + mes + '' + dia;
	},
	descargar: function(direccion, year, i, y) {

	},
	//Funcion para agregar los datos de los boletines a la Base de DAtos.
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
			}); 
		//return true;       
	},
	
	/*
	  Descripción: Funcion para agregar los datos de las Hojas de Vida de los contratistas a la Base de Datos.
	  persona : entidad json con los datos de la persona
	 */
	addPersonasToDB: function(persona) {
		Personas.create(persona)
			.exec(function(error, res) {
				if (error) {
					console.log('Error DB con: ' + persona.NOMBRECOMPLETO + 'Error: ' + error);
					return false;
				} else {
					console.log('DB OK: ' + persona.NOMBRECOMPLETO);
					return true;
				}
			}); 
	},

	
	addLinksToDB: function(link, infoLink) {

		var x = {
			link: link
		};		
		Links.create(x)
			.exec(function(error, persona) {
				//console.log(boletin);
				if (error) {
					console.log('error DB con: ' + infoLink + 'ERror: ' + error);
					return true;
				} else {
					console.log('OK, DB.');
					return true;
				}
			}); 
		//return true;  CONTRALORÍA: DIRECTORIO DE FUNCIONARIOS Y CONTRATISTAS 2016, CONTRALORÍA GENERAL DE LA REPÚBLICA,
	}

}