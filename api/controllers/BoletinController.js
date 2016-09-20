/**
 * BoletinController
 *
 * @description :: Server-side logic for managing boletins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request'),
	cheerio = require('cheerio'),
	fs = require('fs'),
	urls = [];


module.exports = {

	find: function(req, res) {
		console.log('entro por find function ');
		request('http://www.procuraduria.gov.co/portal/index.jsp?option=net.comtor.cms.frontend.component.pagefactory.NewsComponentPageFactory&action=view-category&category=13&wpgn=null&max_results=1000&first_result=0', function (err, resp, body){
			console.log('resp ' + JSON.stringify(resp.statusCode));

			if (!err && resp.statusCode == 200){
				//console.log('body ' + JSON.stringify(body));
				var $ = cheerio.load(body);
				console.log('$ ' + JSON.stringify($)); //#content', '#titulo_zona_noticias', a.title

				$('a.news-list-title').each(function(){
					//var url =  $(this).attr('href');
					var url =  $(this).text();
					console.log('URL ' + JSON.stringify(url));
					/*if(url.indexOf('i.imgur.com')!= -1){
						urls.push(url);
						console.log('URLS ' + JSON.stringify(urls));
					}*/
					
				});

				console.log(urls.length);
				for(var i = 0; i < urls.length; i++){
					request(urls[i]).pipe(fs.createWriteStream('files/' + i + '.jpg'));

					return res.send(200, {
                            "message": "not found information about this person (username dont exist)",
                            "data": urls
                        });
				}

			}


		});

	}
};

