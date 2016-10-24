/**
 * ProcuraduriaController
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
	cantBoletinesArray = [22, 23, 24, 25, 26, 27, 28],
	yearArray = [2010, 2009, 2008, 2007, 2006, 2005, 2004],
	onceArray = [8, 9, 10, 11, 12, 13],
	onceYearArray = [2011, 2012, 2013, 2014, 2015, 2016],
	i = 1,
	year = 2010,
	linksArray = [],
	y = 0,
	now = moment();

var consecCodigo = 0;
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

//http://www.procuraduria.gov.co/html/noticias_2010/noticias_929.htm
//Módulos que se van hacer públicos
module.exports = {
		/**
		  Descripción: método que hace la búsqueda y recopilación a los boletines del 2011 y años posteriores de la procuraduria y
		  guarda los datos importantes en la BD.
		  req: Request
		  res: Response
		 */
		boletinesNuevos: function(req, res) {

			console.log('Recurso para tomar datos de todos (' + process.env.NUM_RESULT_PROCU_NUEVOS + ')los boletines del 2011 hacia adelante.');

			contador = 1;
			boletinesNuevosError = [];
			//variable de entorno para mejorar la selecion en el ambiente de desarrollo.
			//selecciona el numero de resultados del paginador de la procuraduria para cada año.
			var numeroResultados = process.env.NUM_RESULT_PROCU_NUEVOS;

			var numeroResultados;
			try {
				numeroResultados = process.env.NUM_RESULT_PROCU_NUEVOS;
			} catch (e) {
				console.error('variable no definida: ' + e);
				return;
			}
			for (var key in onceArray) {
				interpretaBoletin(key, onceArray, numeroResultados);
			}
		},
		/**
		  Descripción: método que hace la búsqueda y recopilación a los boletines del 2010 y años anteriores de la procuraduría.
		  req: Request
		  res: Response
		 */
		boletinesAntiguos: function(req, res) {

			console.log('Recurso para tomar datos de todos los boletines del 2010 hacia atrás...');
			var boletinesFalsos = [];
			bucleContador(cantBoletinesArray[y], y);
			if (y > 6) {
				return;
			}
		}
	}
	/*
	  Descripción: Interpreta un archivo html de la lista de boletínes de la página de la procuraduría
	  key: variable que controlael valor de la posicion de array que maneja los años.
	  onceArray: array que contienen los años para el recurso que recupera los boletines nuevos 
	  numeroResultados: variable globar para controlar el numero de resultados del paginador del la página de la procuraduria.
	 */
function interpretaBoletin(key, onceArray, numeroResultados) {
	var direccionWeb = 'http://www.procuraduria.gov.co/portal/index.jsp?option=net.comtor.cms.frontend.component.pagefactory.NewsComponentPageFactory&action=view-category&category=' + onceArray[key] + '&wpgn=null&max_results=' + numeroResultados + '&first_result=0';
	try {
		request(direccionWeb, function(err, resp, body) {
			if (!err && resp.statusCode == 200) {
				//Carga el archivo en operador $
				var $ = cheerio.load(body);
				$('a.news-list-title').each(function() {
					var url = $(this).attr('href');
					if (url === undefined)
						return;

					utils.sleep(500);
					var urla = 'http://www.procuraduria.gov.co/portal/' + url;
					var cuerpo = llamarDb(urla, url);
				});
			} else {
				utils.registrarError(error, urla);
			}
		})
	} catch (e) {
		utils.registrarError(e, urla);
	}
}
/*
  Descripción: Llama a la funcion que graba en base de datos y escribe en disco el archivo html 
  urla : ruta web global dek archivo html
  url: ruta especifica del archivo html
 */
function llamarDb(urla, url) {
	//+var ruta = '/htmlBoletines/' + nombreSinEspacios + '.html';
	try {
		request(urla, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var dataBd = extraerBolBd(body, url);
				dbManager.agregarBoletinToDB(dataBd);
			} else {
				utils.registrarError(error, urla);
			}
		});
	} catch (e) {
		utils.registrarError(e, urla);
	}
}
/*
  Descripción: Extrae los valores de los boletínes requeridos por la base de datos
  err: Mensaje de error retornado por el request
  resp: Código respuesta del request
  body: Contenido de la respuesta del request
  url : url del boletin de la procuraduria.
 */
function extraerBolBd(cuerpo, url) {
	var bodyWithCorrectEncoding = iconv.decode(cuerpo, 'iso-8859-1');
	var $ = cheerio.load(bodyWithCorrectEncoding);
	var textoUno = "";
	var fecha = "";
	var fuente = "";
	var yearBoletin = "";

	//texto boletín
	var texto = $('p.MsoNormal').text().trim().toUpperCase();
	var posParrafo = texto.indexOf(".");
	var textoUnoDos = texto.slice(0, posParrafo).toUpperCase();

	if (texto === undefined || texto == "") {
		$('div[align=justify]').each(function() {
			var datos = $(this).last().text();
			texto = datos.trim().toUpperCase();
			var posParrafo = texto.indexOf(".");
			var textoUnoDos = texto.slice(0, posParrafo).toUpperCase();
		});
	}
	//titulo boletín
	var titulo = $('h2.prueba').text().trim().toUpperCase();

	//boletin  boletín
	var boletin = $('h3.news-view-subtitle').text().trim().toUpperCase();

	//fecha y fuente.
	$('h4').each(function() {
		var datos = $(this).last().text();
		fecha = utils.filtrarFecha(datos).fecha;

		var posIni = datos.indexOf(":");
		var posDos = datos.indexOf("Fecha");
		fuente = datos.slice(posIni + 1, posDos);

		yearBoletin = utils.filtrarFecha(datos).yearBoletin;
	});

	var boletinSinEspacios = utils.eliminarCaracteresEspeciales(boletin, true);
	//Relacionado con
	var relacionadoConDefault = 'PROCURADURIA: DIRECTORIO DE BOLETINES ';
	var relacionadoCon = relacionadoConDefault + ', ' + boletin + ': ' + titulo + '. ' + textoUnoDos;

	request('http://www.procuraduria.gov.co/portal/' + url).pipe(fs.createWriteStream('./htmlBoletines/' + yearBoletin + '_' + boletinSinEspacios + '.html'));

	//IngresaLista
	var fecha = utils.fechaHoy();
	var ingresaLista = 'INGRESA_LISTA: ' + fecha;
	consecCodigo++;
	//Retornamos un json con los valores que debe recibir la base de datos
	return {
		CODIGO: 'TMP_' + consecCodigo,
		RELACIONADO_CON: utils.eliminarCaracteresEspeciales(relacionadoCon, false),
		ROL_O_DESCRIPCION1: utils.eliminarCaracteresEspeciales(texto, false),
		FECHA_UPDATE: utils.eliminarCaracteresEspeciales(fecha, false),
		ESTADO: utils.eliminarCaracteresEspeciales(ingresaLista, false),
	};
}

function bucleContador(totContador, llave) {
	if (y > 6) {
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
				var dataBd = extraerBolAntiguoBd(body, dirInterna, llave);
				dbManager.agregarBoletinToDB(dataBd);
			} else {
				utils.registrarError(error, dirInterna);
			}
		});
	} catch (e) {
		utils.registrarError(e, dirInterna);
	}
	bucleContador(cantBoletinesArray[y], y);
}
/*
  Descripción: Extrae los valores de los boletínes requeridos por la base de datos
  err: Mensaje de error retornado por el request
  resp: Código respuesta del request
  body: Contenido de la respuesta del request
  urlb : url del archivo remoto
 */
function extraerBolAntiguoBd(cuerpo, dirInterna, llave) {

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

	var finalParrafo = boletinArray.length - 1;
	var boletin = boletinArray.slice(0, 1).toString();
	var titulo = boletinArray.slice(1, 2).toString();
	var textoUnoDos = '';
	//numero boletin
	if (boletin.length == 31) {
		boletin = boletin.slice(20);
	} else if (boletinArray[1].toString().length == 31) {
		boletin = boletinArray[1].toString().slice(20);
	} else {
		$('td.marcogris2').each(function() {
			var datoBoletin = $(this).text();
			boletin = datoBoletin.slice(20);
		});
	}
	//titulo
	if (titulo.length > 33 && boletinArray[0].toString().length == 31) {
		titulo = titulo.trim();
	} else if (boletinArray[0].length > 31) {
		titulo = boletinArray[0].toString().trim();
	} else {
		titulo = boletinArray[1].toString();
		if (boletinArray[1].toString().length < 15)
			titulo = 'COMUNICADO DE PRENSA';
	}
	//bloque para filtrar todo el texto completo del boletín.
	if (boletinArray[1].toString().length > 99) {
		var textoCompletoUnoAnterior = boletinArray.slice(1, finalParrafo);
		textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
		textoUnoDos = boletinArray.slice(1, 3).toString().trim();

	} else if (boletinArray[2].toString().length > 99) {
		var textoCompletoUnoAnterior = boletinArray.slice(2, finalParrafo);
		textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
		textoUnoDos = boletinArray.slice(2, 4).toString().trim();

	} else {
		var textoCompletoUnoAnterior = boletinArray.slice(3, finalParrafo);
		textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
		textoUnoDos = boletinArray.slice(3, 5).toString().trim();
		if (boletinArray[2].toString().length < 99)
			var textoCompletoUnoAnterior = boletinArray.slice(4, finalParrafo);
		textoUnoDos = boletinArray.slice(3, 5).toString().trim();
		textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
	}

	if (textoCompletoUno == '') {
		var textoCompletoUnoAnterior = boletinArray.slice(0, finalParrafo);
		textoCompletoUno = textoCompletoUnoAnterior.toString().trim();
		textoUnoDos = boletinArray.slice(0, 2).toString().trim();
	}
	var boletinSinEspacios = boletin.replace(/ /g, "_");

	var writeStream = fs.createWriteStream('./htmlBoletines/' + yearArray[llave] + '_' + boletinSinEspacios + '.html');

	//crea los archivos HTML de los boletines analizados.
	request(dirInterna).pipe(writeStream);
	boletinArray.length = 0;

	//Relacionado con
	var relacionadoConDefault = 'PROCURADURIA: DIRECTORIO DE BOLETINES ';
	var relacionadoCon = relacionadoConDefault + ', ' + boletin + ': ' + titulo + '. ' + textoUnoDos;

	//IngresaLista
	var fecha = utils.fechaHoy();
	var ingresaLista = 'INGRESA_LISTA: ' + fecha;
	consecCodigo++;
	//Retornamos un json con los valores que debe recibir la base de datos
	return {
		CODIGO: 'TMP_' + consecCodigo,
		RELACIONADO_CON: utils.eliminarCaracteresEspeciales(relacionadoCon, false),
		ROL_O_DESCRIPCION1: utils.eliminarCaracteresEspeciales(textoCompletoUno, false),
		FECHA_UPDATE: utils.eliminarCaracteresEspeciales(fecha, false),
		ESTADO: utils.eliminarCaracteresEspeciales(ingresaLista, false),
	};
}