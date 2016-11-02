/**
 * ProcuraduriaOldController
 *
 * @description :: Server-side logic for managing boletins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	iconv = require('iconv-lite'),
	moment = require('moment'),
	utils = require('../utlities/Util'),
	dbManager = require('../utlities/dbManager'),
	testDate = require('date-utils').language("es");

var dirProcuraduria2010 = 'http://www.procuraduria.gov.co/portal/Noticias-2010.page',
	boletinArray = [],
	cantBoletinesArray = [933, 726, 637, 539, 461, 439, 429],//461
	//cantBoletinesArray = [22, 23, 24, 25, 26, 27, 28],
	//cantBoletinesArray = [933, 726],
	//yearArray = [2010, 2009],
	yearArray = [2010, 2009, 2008, 2007, 2006, 2005, 2004],
	i = 1,
	year = 2010,
	linksArray = [],
	y = 0,
	now = moment(),
	consecCodigo = 0;
//Módulos que se van hacer públicos
module.exports = {
		/**
		  Descripción: método que hace la búsqueda y recopilación a los boletines del 2010 y años anteriores de la procuraduría.
		  req: Request
		  res: Response
		 */
		boletinesAntiguos: function(req, res) {

			console.log('-Recurso para tomar datos de todos los boletines del 2010 hacia atrás...');
			var boletinesFalsos = [];
			bucleContador(cantBoletinesArray[y], y);
			if (y > 1) {
				return;
			}
		}
	}

function bucleContador(totContador, llave) {
	if (y > 1) {
		return;
	}
	if (i === undefined)
		i = 1;
	if (i >= totContador) {
		i = 0;
		y++;
		bucleContador(cantBoletinesArray[y], y);
	}
	i++;
	//utils.sleep(500);
	loopBoletin(i, llave);
}

function loopBoletin(i, llave) {

	if (i < 10) {
		var dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + yearArray[llave] + '/noticias_00' + i + '.htm';
	} else if (i > 9 && i < 100) {
		var dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + yearArray[llave] + '/noticias_0' + i + '.htm';
	} else {
		var dirInterna = 'http://www.procuraduria.gov.co/html/noticias_' + yearArray[llave] + '/noticias_' + i + '.htm';
	}
	try {
		request(dirInterna, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log('archivo: ' + dirInterna);
				var data = extraerBolAntiguoBd(body, dirInterna, llave);
				escribirBoletin(body, data[1]);
				dbManager.agregarBoletinToDB(data);
			} else {
				utils.registrarError(error, dirInterna);
			}
		});
	} catch (e) {
		utils.registrarError(e, dirInterna);
	}
	bucleContador(cantBoletinesArray[y], y);
}

function escribirBoletin(cuerpo, data){
	try {
		 var ruta = './htmlBoletines/' + data.yearArray + '_' + data.boletinSinEspacios + '.html';
		 fs.writeFileSync(ruta, cuerpo);
	} catch (er) {
		console.log('er: ' + er);
	}
}
/*
  Descripción: Extrae los valores de los boletínes requeridos por la base de datos
  err: Mensaje de error retornado por el request
  resp: Código respuesta del request
  body: Contenido de la respuesta del request
  urlb : url del archivo remoto
 */
function extraerBolAntiguoBd(cuerpo, dirInterna, llave) {
	//utils.sleep(500);
	var $ = cheerio.load(cuerpo);
	var fechaCodificada = '';
	var fecha = '';

	$('p').each(function() {
		var datos = $(this).last().text();
		boletinArray.push(datos);
		fechaArray = $(this).find("strong").text();
		if (fechaArray.length > 16 && fecha == '' && fechaArray.length < 40 && fechaArray.search('[0-9]') != -1) // && fecha == '' 
			fecha = fechaArray;
	});

	var boletin = String(boletinArray.slice(0, 1).toString());
	var titulo = boletinArray.slice(1, 2).toString();
	try {
		//numero boletin
		if (String(boletin).length == 31) {
			boletin = boletin.toString().slice(20).toUpperCase();
		} else if (String(boletinArray[1]).length == 31) {
			boletin = String(boletinArray[1].toString().slice(20));
		} else {
			$('td.marcogris2').each(function() {
				var datoBoletin = $(this).text();
				boletin = String(datoBoletin.toString()).slice(20);
			});
		}
	} catch (e) {
		console.log('error en la separacion con el boletín');

	}
	try {
		//titulo
		if (titulo.length > 33 && boletinArray[0].toString().length == 31) {
			titulo = titulo.trim().toUpperCase();
		} else if (boletinArray[0].length > 31) {
			titulo = boletinArray[0].toString().trim().toUpperCase();
		} else {
			titulo = boletinArray[1].toString().toUpperCase();
			if (boletinArray[1].toString().length < 15)
				titulo = 'COMUNICADO DE PRENSA';
		}
	} catch (e) {
		console.log('error en la separacion con el boletín');
	}

	var textoUnoDos = utils.filtrarTextoBoletines(boletinArray).textoUnoDos;
	var textoCompletoUno = utils.filtrarTextoBoletines(boletinArray).textoCompletoUno;
	var boletinSinEspacios = utils.eliminarCaracteresEspeciales(boletin, true);

	
	boletinArray.length = 0;

	//Relacionado con
	var relacionadoConDefault = 'PROCURADURIA: DIRECTORIO DE BOLETINES ';
	var relacionadoCon = relacionadoConDefault + ', ' + boletin + ': ' + titulo + '. ' + textoUnoDos;
	utils.sleep(500);
	//IngresaLista
	var fecha = utils.fechaHoy();
	var ingresaLista = 'INGRESA_LISTA: ' + fecha;
	consecCodigo++;
	//Retornamos un json con los valores que debe recibir la base de datos
	var arrayResultado = [
		{
			CODIGO: 'TMP_' + consecCodigo,
			RELACIONADO_CON: utils.eliminarCaracteresEspeciales(relacionadoCon, false),
			ROL_O_DESCRIPCION1: utils.eliminarCaracteresEspeciales(textoCompletoUno, false),
			FECHA_UPDATE: utils.eliminarCaracteresEspeciales(fecha, false),
			ESTADO: utils.eliminarCaracteresEspeciales(ingresaLista, false),
		},
		{
			yearArray : yearArray[llave],
			boletinSinEspacios : boletinSinEspacios
		}
		];
	return arrayResultado;
}