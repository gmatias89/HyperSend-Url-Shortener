//----------------------------------------------Seteo inicial------------------------------------------
//Requires:
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

//Seteo de las librerias

const app = express();

//Conexion de la base de datos
mongoose.connect("DATABASE", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//seteo de EJS
app.set('view engine', 'ejs');

//Seteo de Body-Parser
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json())

//se setea la carpeta de recursos
app.use(express.static("public"));

//----------------------------------------------Schemas de DB------------------------------------------
//se crea un Schema de objeto para esta base de datos
const UrlSchema = new mongoose.Schema({
    full: String,
    short: String
});
//se crea un tipo de objeto en base al schema anterior
const Url = mongoose.model("Url", UrlSchema);


//---------------------------------------------Logica--------------------------------------------------
//GETS Y POSTS----------------------------------------------------------------------------------------

//Ruta principal------------------------------------------------------
app.get("/", function (req, res) {

    res.render("home", { Error: "" });
})
//------------------------------------------------------

//Ruta a la que se redireccionan los errores------------------------------------------------------
app.get("/Home/:Error", function (req, res) {

    let posibleError = req.params.Error;

    if (posibleError == "Error1") {
        //error al guardar la url
        res.render("Error", { Error: "Error al almacenar la URL" });
    }
    else if (posibleError == "Error2") {
        //error la url ya existe
        res.render("Error", { Error: "Error: la Url ya fue almacenada anteriormente" });
    } else if (posibleError == "Error3") {
        //error al intentar entrar a una url inexistente
        res.render("Error", { Error: "Error: la Url no ha sido acortada aun" });
    } else {
        //En caso de que no sea ninguna, se lleva al home directamente
        console.log("Error indefinido");
        res.redirect("/");
    }


});
//------------------------------------------------------

//en caso de que se cree la url y se guarde apropiadamente, se muestra en pantalla--------------------------------------
app.get("/Success:nuevaUrl", function (req, res) {
    res.render("success", { nuevaUrl: ("HyperSend.herokuapp.com/url/" + req.params.nuevaUrl) });

});
//------------------------------------------------------

//La ruta por la cual se entra para acceder a una URL previamente acortada------------------------------------------------------
app.get("/url/:urlshort", function (req, res) {

    Url.findOne({ short: req.params.urlshort }, function (err, foundUrl) {
        if (foundUrl != null) {
            res.redirect(foundUrl.full);
        } else {
            res.redirect("/Home/" + "Error3");
        }
    });
});
//------------------------------------------------------

//La ruta por la cual se guardan las urls al hacer submit en Home------------------------------------------------------
app.post("/", function (req, res) {

    let InputURL = req.body.Url;

    console.log("URL sin modificar: " + InputURL);

    //se envia la url a la funcion HandleURL donde se recorta, se mezcla y se le quitan los caracteres especiales
    InputURL = HandleURL(InputURL);

    console.log(InputURL);



    //se busca si la URL que se esta tratando de ingresar existe previamente en la base de datos
    Url.findOne({ full: req.body.Url }, function (err, foundUrl) {
        if (foundUrl != null) {
            //en caso de que si existe simplemente se redirecciona al usuario y se muestra la ruta que ya existia
            res.redirect("/Success" + foundUrl.short);

        }
        else {
            //si no existe, se crea una nueva url con el schema de la base de datos
            let url = new Url({
                full: req.body.Url,
                short: InputURL
            });

            console.log(url);
            //se guarda el objeto en la base de datos
            url.save(function (err) {
                if (err) {
                    //en caso de existir error a la hora de guardar, se redirecciona al error mostrandolo en pantalla
                    console.log("Error: La URL no pudo ser almacenada en la base de datos");
                    res.redirect("/Home/" + "Error1");

                } else {
                    //en caso de no haber errores se muestra la nueva url en pantalla
                    res.redirect("/Success" + InputURL);

                }
            });
        }
    })




});
//Funciones----------------------------------------------------------------------------------------
//------------------------------------------------------
//se crea un prototipo para poder mezclar los caracteres cualquier variable de tipo string
String.prototype.shuffle = function () {
    var a = this.split(""),
        n = a.length;

    for (var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}
//------------------------------------------------------
//------------------------------------------------------
//se crea una funcion que permita acortar el codigo a la hora de hacer las modificaciones a la URL
function HandleURL(URL) {
    //se eliminan caracteres especiales
    URL = URL.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    console.log("HANDLEURL: URL sin caracteres especiales: " + URL);
    //se mezclan los caracteres 
    URL = URL.shuffle();
    console.log("HANDLEURL: URL Shuffled: " + URL);
    //se recorta la url a solo 5 caracteres
    URL = URL.substring((URL.length - 5), URL.length);
    console.log("HANDLEURL: URL Recortado: " + URL);
    //se retorna la nueva url acortada
    return URL;
}
//------------------------------------------------------
//--------------------------------------------Listen en los puertos-------------------------------------

//se busca si el ambiente tiene un port seteado
let port = process.env.PORT
if (port == null || port == "") {
    //en caso de no ser asi, se le asigna el 3000
    port = 3000;
}

app.listen(port, function () {
    console.log("Server running on port " + port);

});