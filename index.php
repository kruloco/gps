<!DOCTYPE html> 
<html lang="es-Es">
    <head> 
        <title>GPS</title> 
        <meta charset="utf-8"> 
        <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="css/jquery.mobile-1.2.0.min.css" />
        <script src="phonegap.js"></script>
        <script src="js/jquery-1.7.2.min.js"></script>
        <script src="js/jquery.mobile-1.2.0.min.js"></script>
        <script src="js/funciones.js"></script>
    </head> 
    <body> 
        <div data-role="page" id="homePage">
            <div data-role="header" data-position="fixed">
                <h3>Colectivos GPS</h3>
            </div>
            <div data-role="content">

                <a href="#" data-role="button" id="btnOn">Activar</a>
                <a href="#" data-role="button" style="display:none" id="btnOff">Desactivar</a>
                <p id="info"></p>
                <a id='lnkDialog' href="#dialog" data-rel="dialog" data-transition="pop" style='display:none;'></a>
            </div>
        </div>

        <!-- DIALOG ------------------------------------------------------------------ -->  
        <div data-role="page" id="dialog">
            <div data-role="header">
                <h1 id="dialogTitle"></h1>
            </div>    
            <div data-role="content" id="dialogText">
            </div>    
        </div>

    </body>
</html>
