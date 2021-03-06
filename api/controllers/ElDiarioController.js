var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	
	utils = require('../utlities/Util');
const util = require('util');
var unorm = require('unorm');
var iconv = require('iconv-lite');
var y = 0;
var moment = require('moment');
var now = moment();
var testDate = require('date-utils').language("es");

module.exports = {
/**
  Descripción: método que hace la búsqueda en la página del Diario del otun
  req: Request
  res: Response
 */
secciones: function(req, res) {

  //console.log('Recurso para tomar datos de todos (' + process.env.NUM_RESULT_PROCU_NUEVOS + ')los boletines del 2011 hacia adelante.');

  contador = 1;
  boletinesNuevosError = [];
  interpretaPagina(req, res);
 
}
}
/*
Descripción: Interpreta un archivo html de la pagina principal del Diario del otun.
key: variable que controlael valor de la posicion de array que maneja los años.
onceArray: array que contienen los años para el recurso que recupera los boletines nuevos
numeroResultados: variable globar para controlar el numero de resultados del paginador del la página de la procuraduria.
*/
function interpretaPagina(req, res) {
var direccionWeb = 'http://www.eldiario.com.co/inicio';
var resultados = [];

try {
request(direccionWeb, function(err, resp, body) {
  if (!err && resp.statusCode == 200) {
    //Carga el archivo en operador $
    var $ = cheerio.load(body);
    $('.titular a').each(function() {
      var url = $(this).text();
      if (url === undefined)
        return;
     // utils.sleep(100);
      console.log('archivo: -' + url);
      resultados.push(url);
      //var cuerpo = llamarDb(urla, url);
    });
    res.view('diarioDelOtun', {
            results: resultados
        });
  } else {
    utils.registrarError(err, urla);
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
    var data = extraerBolBd(body, url);
    escribirBoletin(body, data[1]);
    dbManager.agregarBoletinToDB(data[0]);
  } else {
    utils.registrarError(error, urla);
  }
});
} catch (e) {
console.log('ARRAY: ' + linksArrayFile);
console.log('URL: ' + url);
console.log('URLA: ' + urla);
utils.registrarError(e, urla);
linksArrayFile.push(urla);

}
}

function escribirBoletin(cuerpo, data) {
try {
var ruta = './htmlBoletines/' + data.yearBoletin + '_' + data.boletinSinEspacios + '.html';
fs.writeFileSync(ruta, cuerpo, (err) => {
    if (err) throw err;
    console.log('It\'s saved!');

  });
}
catch (er) {
  console.log('Er en Manejador de errores: ' + er);

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
var arrayResultado = [{
  CODIGO: 'TMP_' + consecCodigo,
  RELACIONADO_CON: utils.eliminarCaracteresEspeciales(relacionadoCon, false),
  ROL_O_DESCRIPCION1: utils.eliminarCaracteresEspeciales(texto, false),
  FECHA_UPDATE: utils.eliminarCaracteresEspeciales(fecha, false),
  ESTADO: utils.eliminarCaracteresEspeciales(ingresaLista, false),
}, {
  yearBoletin: yearBoletin,
  boletinSinEspacios: boletinSinEspacios
}];
return arrayResultado;
}
