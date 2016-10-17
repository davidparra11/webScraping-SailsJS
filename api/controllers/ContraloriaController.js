/* Requires */
var request = require('request'), // Realiza las peticiones GET y POST asincrónicamente
	//request = require('sync-request'), // Realiza las peticiones GET y POST sincrónicamente
	cheerio = require('cheerio'), // Interpreta un archivo Html
	util = require('util'), // Permite ampliar la información sobre los errores
	utils = require('../utlities/Util'), // Guarda en la base de datos
	fs = require('fs'), // Administrador del sistema de archivos
	walk = require('walk'), // Recorre los archivos
	dbManager = require('../utlities/dbManager') //Realiza las operaciones de base de datos
	;

var consecCodigo = 0;
var totalBusqueda = 0;
var archivoActual = 0;
//Módulos que se van a hacer públicos
module.exports = {

	/*
	  Descripción: método que recupera las HVs de los contratistas, los pasa a HTML y guarda datos importantes en DB.
	  req: Request
	  res: Response
	 */
	descargaHtmls2: function(req, res) {
		console.log('Inicio de la interpretación de las hojas de vida de los contratistas del Estado');
		
		//lista los archivos de la ruta indicada
		var dirs = fs.readdirSync(process.env.RUTA_CONTRATISTAS);
		totalBusqueda = dirs.length;
		for (var i = 0 ; i<totalBusqueda; i++){
			archivoActual = i;
			var root = '../Contraloria';
			interpretaHV(root, dirs[i]); 
		}
	}
}

/*
  Descripción: Interpreta un archivo html
  root: ruta local del archivo
  stat: status de la lectura del archivo con atributos básicos
  next: callback al siguiente archivo
 */
function interpretaHV(root, name) {
	//Carga el archivo en operador $
	var $ = cheerio.load(fs.readFileSync(root + '/' + name));
	$('a[ctype=c]').each(function() {
		var url = $(this).attr('href');
		var nombreUno = $(this).text().toString();
		utils.sleep(500);
		var cuerpo = escribirArchivoHtml(nombreUno, url);
	});
}

/*
  Descripción: Escribe un archivo html en el disco
  nombreUno: Nombre completo del archivo con caracteres especiales
  urla : url del archivo remoto
 */
function escribirArchivoHtml(nombreUno, urla){
	var nombreSinEspacios = utils.eliminarCaracteresEspeciales(nombreUno, true);
	var ruta = '/htmls/' + nombreSinEspacios + '.html';
	try {
		var writeStream = fs.createWriteStream('.' + ruta);
		request (urla, function(error, response, body){
			if(!error && response.statusCode == 200){
				var dataBd = extraerHvBd(body);
				console.log(archivoActual + ' de ' + totalBusqueda);
				dbManager.addPersonasToDB(dataBd);
			}
			else{
				utils.registrarError(error, urla);
			}
		}).pipe(writeStream);
	} catch (e) {
		utils.registrarError(e, urla);
	}
}

/*
  Descripción: Extrae los valores de la hoja de vida requeridos por la base de datos
  err: Mensaje de error retornado por el request
  resp: Código respuesta del request
  body: Contenido de la respuesta del request
  urlb : url del archivo remoto
 */
function extraerHvBd(cuerpo)
{
	var $ = cheerio.load(cuerpo);
	
	var lugar_nacimiento = "";
	
	//Nombre funcionario
	var nombre = $('span.nombre_funcionario')
				.text()
				.toUpperCase();
	//Cargo funcionario
	var cargo = $('span.cargo_funcionario')
				.text()
				.toUpperCase();

	//Entidad
	var institucion_funcionario = $('span.institucion_funcionario')
				.text()
				.toUpperCase();
	
	// Lugar de nacimiento
	$('span').each(function() {
		var datos = $(this).last().text();
		if(datos.indexOf('Municipio de Nacimiento') >= 0)
		{
			lugar_nacimiento = $(this).next().text();
		}
	});

	//Relacionado con
	var relacionadoConDefault = 'CONTRALORIA: DIRECTORIO DE FUNCIONARIOS Y CONTRATISTAS 2016, ';
	var relacionadoCon = relacionadoConDefault + institucion_funcionario + ' ' + lugar_nacimiento + ', ' + cargo;
	
	//IngresaLista
	var fecha = utils.fechaHoy();
	var ingresaLista = 'INGRESA_LISTA: ' + fecha;
	consecCodigo++;
	//Retornamos un json con los valores que debe recibir la base de datos
	return {
		CODIGO : 'TMP_' + consecCodigo, 
		NOMBRECOMPLETO: utils.eliminarCaracteresEspeciales(nombre, false),
		RELACIONADO_CON: utils.eliminarCaracteresEspeciales(relacionadoCon, false),
		DIRECCION: utils.eliminarCaracteresEspeciales(lugar_nacimiento, false),
		FECHA_UPDATE: utils.eliminarCaracteresEspeciales(fecha, false),
		ESTADO: utils.eliminarCaracteresEspeciales(ingresaLista, false),
	};	
}

