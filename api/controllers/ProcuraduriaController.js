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
	onceArray = [8, 9, 10, 11, 12, 13],
	//onceArray = [8, 9],
	//onceYearArray = [2011, 2012],
	onceYearArray = [2011, 2012, 2013, 2014, 2015, 2016],
	year = 2010,
	linksArray = [],
	now = moment(),
	consecCodigo = 0;
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
		}
	}
	/*
	  Descripción: Interpreta un archivo html de la lista de boletínes de la página de la procuraduría
	  key: variable que controlael valor de la posicion de array que maneja los años.
	  onceArray: array que contienen los años para el recurso que recupera los boletines nuevos 
	  numeroResultados: variable globar para controlar el numero de resultados del paginador del la página de la procuraduria.
	 */
function interpretaBoletin(key, onceArray, numeroResultados) {
	var direccionWeb = 'http://www.procuraduria.gov.co/portal/index.jsp?option=net.comtor.cms.' + 
	'frontend.component.pagefactory.NewsComponentPageFactory&action=view-category&category=' + 
	onceArray[key] + '&wpgn=null&max_results=' + numeroResultados + '&first_result=0';
	
	try {
		request(direccionWeb, function(err, resp, body) {
			if (!err && resp.statusCode == 200) {
				//Carga el archivo en operador $
				var $ = cheerio.load(body);
				$('a.news-list-title').each(function() {
					var url = $(this).attr('href');
					if (url === undefined)
						return;

					utils.sleep(2000);
					console.log('archivo: -' + url);
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
			if (!error && response.statusCode == 200)
			 {
				var data = extraerBolBd(body, url);
				escribirBoletin(body, data[1]);
				dbManager.agregarBoletinToDB(data[0]);
			} else {
				utils.registrarError(error, urla);
			}
		});
	} catch (e) {
		utils.registrarError(e, urla);
	}
}
function escribirBoletin(cuerpo, data){
	try {
		 var ruta = './htmlBoletines/' + data.yearBoletin + '_' + data.boletinSinEspacios + '.html';
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
	//titulo 
	var titulo = String($('h2.prueba').text().trim());

	//boletin  
	var boletin = String($('h3.news-view-subtitle').text().trim());

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
	//+utils.sleep(500);

	//IngresaLista
	var fecha = utils.fechaHoy();
	var ingresaLista = 'INGRESA_LISTA: ' + fecha;
	consecCodigo++;
	//Retornamos un json con los valores que debe recibir la base de datos
	var arrayResultado = [
		{
			CODIGO: 'TMP_' + consecCodigo,
			RELACIONADO_CON: utils.eliminarCaracteresEspeciales(relacionadoCon, false),
			ROL_O_DESCRIPCION1: utils.eliminarCaracteresEspeciales(texto, false),
			FECHA_UPDATE: utils.eliminarCaracteresEspeciales(fecha, false),
			ESTADO: utils.eliminarCaracteresEspeciales(ingresaLista, false),
		},
		{
			yearBoletin : yearBoletin,
			boletinSinEspacios : boletinSinEspacios
		}
		];
	return arrayResultado;
}
