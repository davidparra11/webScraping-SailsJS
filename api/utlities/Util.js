//"use strict"; //utils
var request = require('request'),
	cheerio = require('cheerio');

module.exports = {
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
	//Funcion para agregar los datos de las Hojas de Vida de los contratistas a la Base de Datos.
	addPersonasToDB: function(nombreCompleto, relacionadoCon, direccion, fechaUpdate, estado, infoBoletin) {

		var x = {
			NOMBRECOMPLETO: nombreCompleto,			
			RELACIONADO_CON: relacionadoCon,
			DIRECCION: direccion,
			FECHA_UPDATE: fechaUpdate,
			ESTADO: estado,
		};		
		Personas.create(x)
			.exec(function(error, persona) {
				//console.log(boletin);
				if (error) {
					console.log('error DB con: ' + infoBoletin + 'ERror: ' + error);
					return true;
				} else {
					console.log('OK, DB.');
					return true;
				}
			}); 
		//return true;  CONTRALORÍA: DIRECTORIO DE FUNCIONARIOS Y CONTRATISTAS 2016, CONTRALORÍA GENERAL DE LA REPÚBLICA,
	}

}