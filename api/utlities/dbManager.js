module.exports = {
	/*
	  Descripción: Funcion para agregar los datos de las Hojas de Vida de los contratistas a la Base de Datos.
	  persona : entidad json con los datos de la persona
	 */
	addPersonasToDB: function(persona) {
		Personas.create(persona)
			.exec(function(error, res) {
				if (error) {
					console.log('Error DB con: ' + persona.NOMBRECOMPLETO + 'Error: ' + error);
					return false;
				} else {
					return true;
				}
			}); 
	},
	//Funcion para agregar los datos de los boletines a la Base de DAtos.
	agregarBoletinToDB: function(boletin) {

		Personas.create(boletin)
			.exec(function(error, res) {
				if (error) {
					console.log('error DB; boletin: ' + boletin.CODIGO + 'Error: ' + error);
					return true;
				} else {
					console.log('OK, DB');
					return true;
				}
			});      
	}
}