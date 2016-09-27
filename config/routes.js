/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'index'
  },
  '/procuraduria': {
    view: 'procuraduria'
  },

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the custom routes above, it   *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/
  // El método realiza el análisi a los boletines de la procuradura del 2011 y después.
  'GET /boletin': 'BoletinController.find',
  // El método realiza el análisi a los boletines de la procuradura del 2010 y antes.
  'GET /boletin2010': 'BoletinController.findOld',
  // El método realiza el análisi a el boletin del 2010 o antes entrado como parametro GET .
  'GET /individual': 'BoletinController.individual',
  // El método realiza el análisi a los boletin del 2011 o después entrado como parametro.
  'GET /individual2011': 'BoletinController.individual2011',


  // El método realiza un análisis en los archivos locales de la Contraloría. 
  'GET /contraloria': 'PersonasController.analizar',
  //Obtener todos los archivo de la ruta.
  'GET /archivosContraloria': 'PersonasController.recogerTodo',
  //Método que desglosa los archivo html individualmente .
  'GET /individualContraloria': 'PersonasController.recogerTodo'

};
