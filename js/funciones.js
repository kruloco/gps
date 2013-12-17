$(function() {

// Objeto para encapsular las funciones
    var Gps = {};
    (function(app) {
        var celular = {'estado': false, 'conexion': '', 'plataforma': ''},
        idColectivo = 1, latitud, longitud, servidor = "http://colectivo.site90.net/", watchID;
        // Función principal autoejecutable
        app.init = function() {
            document.addEventListener('deviceready', app.bindingsPG, false);
            app.bindings();
        };
        //Inicializa todos los EVENTOS de la página
        app.bindings = function() {
            //Al tocar el botón ACTIVAR
            $("#btnOn").on('click', function() {
                app.intercambiarBotones();
                app.activarGPS();
            });
            //Al tocar el botón DESACTIVAR
            $("#btnOff").on('click', function() {
                app.intercambiarBotones();
                navigator.geolocation.clearWatch(watchID);
            });
            //Al tocar el botón SALIR
            $("#btnSalir").on('click', function() {
                app.cerrarAplicacion();
            });
        };
//Manejador de eventos de PhoneGap
        app.bindingsPG = function()
        {
            celular.conexion = app.getConexion();
            app.mostrarModal('Estás conectado mediante: ' + celular.conexion, "Conexion");
            if ((celular.conexion !== 'Ninguna') && (celular.conexion !== 'Desconocida')) {
                celular.estado = true;
            }
            celular.plataforma = device.platform;
            document.addEventListener("online", function() {
                celular.estado = true;
            }, false);
            document.addEventListener("offline", function() {
                celular.estado = false;
            }, false);
        };
// CALLBACK SUCCESS DEL WATCH
        app.onSuccess = function(position) {
            var lat = position.coords.latitude, lng = position.coords.longitude;
            if (lat !== latitud || lng !== longitud)
            {
                latitud = lat;
                longitud = lng;
                app.enviarPedido();
            }
        };
// CALLBACK ERROR DEL WATCH
        app.onError = function(error) {
            app.mostrarModal('codigo: ' + error.code + '\n mensaje: ' + error.message, 'Error');
        };
        //Devuelve el tipo de conexion del dispositivo
        app.getConexion = function() {
            var estadoRed = navigator.connection.type;
            var estados = {};
            estados[Connection.UNKNOWN] = 'Desconocida';
            estados[Connection.ETHERNET] = 'Ethernet';
            estados[Connection.WIFI] = 'WiFi';
            estados[Connection.CELL_2G] = '2G';
            estados[Connection.CELL_3G] = '3G';
            estados[Connection.CELL_4G] = '4G';
            estados[Connection.NONE] = 'Ninguna';
            return estados[estadoRed];
        };
        app.cerrarAplicacion = function() {
            navigator.app.exitApp();
        };
        app.intercambiarBotones = function() {
            $("#btnOn").toggle();
            $("#btnOff").toggle();
        };
//Si hay conexión a internet, obtiene la posición actual y la envía al servidor remoto
//Si no, muestra modal y elimina el timer
        app.activarGPS = function() {

            if (celular.estado)
            {
                // devuelve la posicion cada 1 minuto.  enableHighAccuracy: true
                watchID = navigator.geolocation.watchPosition(app.onSuccess, app.onError, {frequency: 60 * 1000}); 
            }
            else
            {
                app.mostrarModal('No hay conexión a internet', 'Error');
                app.intercambiarBotones();
            }
        };
//Envia un jsop a un servidor remoto con la lat, lng, idColectivo
        app.enviarPedido = function() {
            var paquete = {lat: latitud, lng: longitud, id: idColectivo};
            $.ajax({
                url: servidor + 'controladorColectivo.php',
                data: paquete,
                dataType: 'jsonp',
                success: function(data) {
                    $('#info').html(app.obtenerFecha() + '<br>Latitud: ' + latitud + '<br>Longitud: ' + longitud);
                },
                error: function(data) {
                    $('#info').html(app.obtenerFecha() + '<br>ERROR');
                    console.debug(data);
                }
            });
        };
        //Parseador de la fecha actual y hora
        app.obtenerFecha = function() {
            var nombres_dias = new Array('Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'),
                    nombres_meses = new Array('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'),
                    fecha_actual = new Date(),
                    dia_mes = fecha_actual.getDate(),
                    dia_semana = fecha_actual.getDay(),
                    mes = fecha_actual.getMonth() + 1,
                    anio = fecha_actual.getFullYear(),
                    fechaHora = new Date(),
                    horas = fechaHora.getHours(),
                    minutos = fechaHora.getMinutes(),
                    segundos = fechaHora.getSeconds(),
                    sufijo = 'AM';

            if (horas > 12) {
                horas = horas - 12;
                sufijo = 'PM';
            }

            if (horas < 10) {
                horas = '0' + horas;
            }
            if (minutos < 10) {
                minutos = '0' + minutos;
            }
            if (segundos < 10) {
                segundos = '0' + segundos;
            }

            return nombres_dias[dia_semana] + ', ' + dia_mes + ' de ' + nombres_meses[mes - 1] + ' de ' + anio + '<br>' + horas + ':' + minutos + ':' + segundos;
        };

        //Recibe una cadena de teto y la muestra en un Modal de Error
        app.mostrarModal = function(texto, titulo) {
            $("#lnkDialog").click();
            $("#dialogText").html(texto);
            $("#dialogTitle").html(titulo);
        };
        //Ejecuto función principal
        app.init();
    })(Gps);
});
