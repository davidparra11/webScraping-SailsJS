var	util = require('util'); // Permite ampliar la información sobre los errores
	
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
	},

	registrarError: function (err, url){
		console.log('Error: ' + err + 'URL: ' + url);
		console.log('Detalles: ', util.inspect(err, {
			showHidden: true,
			depth: 2
		}));
	},

	eliminarCaracteresEspeciales: function (cadena, remplazarEspacioPorGuionBajo){
		var res = cadena
			.replace(/\t/g, "")
			.replace(/\n/g, "")
			.trim()
			.toUpperCase()
			.replace(/Ñ/g, 'N')
			.replace(/\?/g, 'N')
			.replace(/Á/g, 'A')
			.replace(/É/g, 'E')
			.replace(/Í/g, 'I')
			.replace(/Ó/g, 'O')
			.replace(/Ú/g, 'U')
			;
		if(remplazarEspacioPorGuionBajo)
		{
			return res.replace(/ /g, '_');
		}
		return res;
	},
	
	sleep: function (ms){
		var waitTill = new Date(new Date().getTime() + ms);
		while (waitTill > new Date()) {}
	}
}