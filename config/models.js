/**
 * Default model configuration
 * (sails.config.models)
 *
 * Unless you override them, the following properties will be included
 * in each of your models.
 *
 * For more info on Sails models, see:
 * http://sailsjs.org/#!/documentation/concepts/ORM
 */

module.exports.models = {

  /***************************************************************************
  *                                                                          *
  * Your app's default connection. i.e. the name of one of your app's        *
  * connections (see `config/connections.js`)                                *
  *                                                                          *
  ***************************************************************************/
    connection: 'localDiskDb',  //sqlserver,localDiskDb,process.env.CONNDB

  /***************************************************************************
  *                                                                          *
  * How and whether Sails will attempt to automatically rebuild the          *
  * tables/collections/etc. in your schema.                                  *
  *                                                                          *
  * See http://sailsjs.org/#!/documentation/concepts/ORM/model-settings.html  *
  *                                                                          *
  ***************************************************************************/
    migrate: 'safe',  //safe - alter  - drop

    //connection : 'productionPosgrest',
    //schema     : false,             // habilita el uso de esquemas en DB

    /*
    Por defecto sails busca y crea con estos campos, asi que es bueno deshabilitarnos
    si se trabaja con una DB que no ha sido creada por completo con el ORM
    */
    autoCreatedAt   : false,
    autoUpdatedAt   : false

};
