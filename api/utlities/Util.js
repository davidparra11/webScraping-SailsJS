//"use strict"; //utils
var request = require('request'),
	cheerio = require('cheerio'),
	boletinArray = [],
	boletinArrayHtml = [],
	urls = [];

module.exports = {
    descargar: function(direccion, year, i, y) {

    	request(direccion, function(err, resp, body) {
		//	console.log('resp ' + JSON.stringify(resp.statusCode));

			if (!err && resp.statusCode == 200) {
				//console.log('body ' + JSON.stringify(body));

				var $ = cheerio.load(body);
				//console.log('$ ' + JSON.stringify($)); //#content', '#titulo_zona_noticias', a.title, 

				var fecha = "";



				$('p').each(function() {
					//var url =  $(this).attr('href');
					var datos = $(this).last().text();
				//	console.log('Texto: ' + JSON.stringify(datos));
					boletinArray.push(datos);

				});

				

				var finalParrafo = boletinArray.length - 1;

				var boletin = boletinArray.slice(0, 1).toString();
				var titulo = boletinArray.slice(1, 2).toString();
				var textoCompletoUno = boletinArray.slice(4, finalParrafo).toString(); //boletinArray.slice(4, 8).toString()

				var textoUnoDos = boletinArray.slice(4, 6).toString();


				//se implementa para sacar la fecha del archivo html.			
				$('span.textopeq').each(function() {
					var datoFecha = $(this).text();
					console.log('Fecha: ' + JSON.stringify(datoFecha));
					fecha = datoFecha;


				});
				console.log('YEAR: '+ year + ' -i: ' + i + ' -y: ' + y);

				console.log('boletin: ' + JSON.stringify(boletin));
				console.log('Titulo: ' + JSON.stringify(titulo));
				//console.log('TextoCompletoUno: ' + textoCompletoUno);
				//console.log('Texto1y2: ' + textoUnoDos);


				var x = {
					titulo: titulo,
					boletin: boletin,
					textoCompleto: textoCompletoUno, //'textoCompleto'   jsonString
					textoUnoDos: textoUnoDos,
					fecha: fecha,
					fuente: 'no aplica'
				};

				boletinArray.length = 0;
				//console.log(x);
				/*Boletin.create(x)
				.exec(function(error, boletin) {
					console.log(boletin);
					if (error) {
						//  utils.showLogs(409, "ERROR", method, controller, 1);
						/*return res.send(409, {
							"message": "Conflict to create boletin",
							"data": error
						});
						console.log('error DB');

					} else {*/
						//   utils.showLogs(200, "OK", method, controller, 0);
						/*return res.send(200, {
							"message": "Create boletin success",
							"data": [{
								id: "boletin.id OK"
							}]
						});
						console.log('OK');
						return true;
					}
				}); */

				//return true;
				i++;
						bucleContador(i, y);


			} else{

				console.log('Hubo un error en la descarga de la página');
				i++;
						bucleContador(i, y);
			}

		});

       
    },

    agregarToDB: function(boletin, titulo, textoCompletoUno, textoUnoDos, fecha , fuente) {    	

				var x = {
					titulo: titulo,
					boletin: boletin,
					textoCompleto: textoCompletoUno,
					textoUnoDos: textoUnoDos,
					fecha: fecha,
					fuente: fuente
				};

				boletinArray.length = 0;
				//console.log(x);
				Boletin.create(x)
				.exec(function(error, boletin) {
					//console.log(boletin);
					if (error) {
						console.log('error DB');
						return true;
					} else {						
						console.log('OK');
						return true;
					}
				}); /**/

				//return true;       
    }
   
}




