/* Requires */
var request = require('request'), // Realiza las peticiones GET y POST
	cheerio = require('cheerio'), // Interpreta un archivo Html
	util = require('util'), // Permite ampliar la información sobre los errores
	utils = require('../utlities/Util'), // Guarda en la base de datos
	fs = require('fs'), // Administrador del sistema de archivos
	walk = require('walk') // Recorre los archivos
	;

//Módulos que se van a hacer públicos
module.exports = {

	/*
	  Descripción: método que recupera las HVs de los contratistas, los pasa a HTML y guarda datos importantes en DB.
	  req: Request
	  res: Response
	 */
	descargaHtmls2: function(req, res) {
		console.log('Recurso para tomar datos de las personas en la página Contraloria y crear archivos HTML...');
		
		//lista los archivos de la ruta indicada
		var walker = walk.walk(process.env.RUTA_CONTRATISTAS, { followLinks: false});
		try {
			//Recorre los archivos secuencialmente
			walker.on('file', function(root, stat, next) {
				//Realiza la interpretación de las hojas de vida del archivo actual
				interpretaHV(root, stat, next); 
				//avanza a la siguiente posición de la lista de archivos
				next();
			});
		} catch (e) {
			console.log('Error: ' + e)
		}
	}
}

/*
  Descripción: Interpreta un archivo html
  root: ruta local del archivo
  stat: status de la lectura del archivo con atributos básicos
  next: callback al siguiente archivo
 */
function interpretaHV(root, stat, next) {
	//Carga el archivo en operador $
	var $ = cheerio.load(fs.readFileSync(root + '/' + stat.name));

	$('a[ctype=c]').each(function() {
		var url = $(this).attr('href');
		var nombreUno = $(this).text().toString();
		
		var waitTill = new Date(new Date().getTime() + 500);
		while (waitTill > new Date()) {}

		request(url, function(err, resp, body) {
			if (!err && resp.statusCode == 200) {
				var ruta = escribirArchivoHtml(nombreUno, url);
				var dataBd = extraerHvBd(root, ruta);
				utils.addPersonasToDB(dataBd);

			}else{
				console.log('ERRORS REQUEST: ' + err + 'URL: ' + url);
				console.log('My dish error: ', util.inspect(err, {
					showHidden: true,
					depth: 2
				}));
			}
		});
	});
}
/*
  Descripción: Extrae los valores de la hoja de vida requeridos por la base de datos
  err: Mensaje de error retornado por el request
  resp: Código respuesta del request
  body: Contenido de la respuesta del request
  urlb : url del archivo remoto
 */
function extraerHvBd(root, ruta)
{
	var $ = cheerio.load(fs.readFileSync('.' + ruta));
	$=cheerio.load($('body'));

	var lugar_nacimiento = "";
	
	//Nombre funcionario
	var nombre = $('span.nombre_funcionario')
				.text()
				.toUpperCase();
	console.log('Nombre: ' + nombre);
	
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
	var relacionadoConDefault = 'CONTRALORÍA: DIRECTORIO DE FUNCIONARIOS Y CONTRATISTAS 2016, ';
	var relacionadoCon = relacionadoConDefault + institucion_funcionario + ' ' + lugar_nacimiento + ', ' + cargo;
	
	//IngresaLista
	var fecha = utils.fechaHoy();
	var ingresaLista = 'INGRESA_LISTA: ' + fecha;

	//Retornamos un json con los valores que debe recibir la base de datos
	return {
		NOMBRECOMPLETO: nombre,			
		RELACIONADO_CON: relacionadoCon,
		DIRECCION: lugar_nacimiento,
		FECHA_UPDATE: fecha,
		ESTADO: ingresaLista,
	};	
}

/*
  Descripción: Escribe un archivo html en el disco
  nombreUno: Nombre completo del archivo con caracteres especiales
  urla : url del archivo remoto
 */
function escribirArchivoHtml(nombreUno, urla){
	var nombreSinEspacios = nombreUno.replace(/\t/g, "")
			.replace(/\n/g, "")
			.trim()
			.replace(/ /g, '_')
			.replace(/ñ/g, "n")
			.replace(/Ñ/g, "N")
			.replace(/\?/g, "n")
			.toUpperCase();
	var ruta = '/htmls/' + nombreSinEspacios + '.html';
	try {
		var writeStream = fs.createWriteStream('.' + ruta);

		request
			.get({
				uri: urla
			})
			.on('error', function(err) {
				console.log('ERRORS REQUEST: ' + err + 'URL: ' + urla);
				console.log('My dish error: ', util.inspect(err, {
					showHidden: true,
					depth: 2
				}));
			})
			.pipe(writeStream); 
		return ruta;

	} catch (exception) {
		console.log(exception);
		return "";
	}
}