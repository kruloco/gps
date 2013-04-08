$(function() {

// Objeto para encapsular las funciones
    var Gps = {};
    var celular = {'estado': false, 'conexion': '', 'plataforma': ''};
    var activarBucle = null,
            idColectivo = 1, latitud, longitud,
            servidor = "http://colectivo.site90.net/";

    (function(app) {

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
                activarBucle = setInterval(function() {
                    app.activarGPS();
                }, 10000);
            });

            //Al tocar el botón DESACTIVAR
            $("#btnOff").on('click', function() {
                app.intercambiarBotones();
                clearInterval(activarBucle);
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
            app.mostrarModal(celular.conexion, "Conexion");
            if ((celular.conexion !== 'Ninguna') && (celular.conexion !== 'Desconocida')) {
                celular.estado = true;
            }
            celular.plataforma = device.platform;
            if ((celular.plataforma === "Android") || (celular.plataforma === "3.0.0.100")) {
                document.addEventListener("online", function() {
                    celular.estado = true;
                }, false);
                document.addEventListener("offline", function() {
                    celular.estado = false;
                }, false);
            }
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
                app.detectarUbicacion(function(lat, lng) {
                    if (lat !== latitud || lng !== longitud)
                    {
                        latitud = lat;
                        longitud = lng;
                        app.enviarPedido();
                    }
                });
            }
            else
            {
                app.mostrarModal('No hay conexión a internet', 'Error');
                clearInterval(activarBucle);
                app.intercambiarBotones();
            }
        };

        app.enviarPedido = function() {
            var paquete = {lat: latitud, lng: longitud, id: idColectivo};
            var fecha = new Date();
            $.ajax({
                url: servidor + 'controladorColectivo.php',
                data: paquete,
                type: 'POST',
                success: function(data) {
                    $('#info').html(fecha.toLocaleString() + ' - ' + data);
                },
                error: function(data) {
                    $('#info').html(fecha.toLocaleString() + ' - Error');
                    console.debug(data);
                }
            });
        };

////Detecta la ubicación del usuario a través de W3C
//Si la encuentra, la escribe en el campo ORIGEN
//Si no la encuentra, escribe en el campo origen la Plaza independencia
        app.detectarUbicacion = function(callback) {
            var browserSupportFlag = new Boolean();
            if (navigator.geolocation)
            {
                browserSupportFlag = true;
                navigator.geolocation.getCurrentPosition(
                        function(position) {
                            callback(position.coords.latitude, position.coords.longitude);
                        },
                        function() {
                            errorNoGeolocation(browserSupportFlag);
                        },
                        {enableHighAccuracy: true});
            } else
            {
                browserSupportFlag = false;
                errorNoGeolocation(browserSupportFlag);
            }

//Si no puede geolocalizar, escribe la plaza independencia
            function errorNoGeolocation(browserSupportFlag) {
                if (browserSupportFlag === true)
                {
                    app.mostrarModal("<p>Falló el servicio de Geolocalización.</p>\n\
            <p>Activa los servicios de Ubicación en tu dispositivo o el GPS para mayor precisión.</p>");
                } else {
                    app.mostrarModal("Tu navegador no soporta Geolocalización.");
                }
            }
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
