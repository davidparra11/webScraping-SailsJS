var	util = require('util'); // Permite ampliar la información sobre los errores
var moment = require('moment');
var moment = now = moment();
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
			.replace(/\//g, '')
			.replace(/•/gi, '')
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

	filtrarFecha: function (datos){
		
		var pos = datos.indexOf("n:");
		var fechaSinFiltro = datos.slice(pos + 2);
		var posTres = fechaSinFiltro.indexOf(",");
		var fechaSinFormato = fechaSinFiltro.slice(posTres + 1);
		var patt1 = /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/g;
		var result = fechaSinFormato.match(patt1);
		//var result2 = result.toLocaleLowerCase();
		var mes = Date.getMonthNumberFromName(result.toString().trim());
		var mesNombre = month[mes];
		var fechaSinMes = fechaSinFormato.replace(result, "");
		var fecha = mesNombre + ' ' + fechaSinMes;

		var patt2 = /(2011|2012|2013|2014|2015|2016)/g;
		yearBoletin = fechaSinFormato.match(patt2);
		return {fecha:fecha,
			yearBoletin: yearBoletin
		};
	},


	filtrarTextoBoletines: function (datos){
		
		var pos = datos.indexOf("n:");
		var fechaSinFiltro = datos.slice(pos + 2);
		var posTres = fechaSinFiltro.indexOf(",");
		var fechaSinFormato = fechaSinFiltro.slice(posTres + 1);
		var patt1 = /(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/g;
		var result = fechaSinFormato.match(patt1);
		//var result2 = result.toLocaleLowerCase();
		var mes = Date.getMonthNumberFromName(result.toString().trim());
		var mesNombre = month[mes];
		var fechaSinMes = fechaSinFormato.replace(result, "");
		var fecha = mesNombre + ' ' + fechaSinMes;

		var patt2 = /(2011|2012|2013|2014|2015|2016)/g;
		yearBoletin = fechaSinFormato.match(patt2);
		return {fecha:fecha,
			yearBoletin: yearBoletin
		};
	},
	
	sleep: function (ms){
		var waitTill = new Date(new Date().getTime() + ms);
		while (waitTill > new Date()) {}
	},
	
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