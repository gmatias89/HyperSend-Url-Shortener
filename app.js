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

const UrlSchema = new mongoose.Schema({
    full: String,
    short: String
});

const Url = mongoose.model("Url", UrlSchema);


//---------------------------------------------Logica--------------------------------------------------
//GETS Y POSTS----------------------------------------------------------------------------------------
app.get("/", function (req, res) {

    res.render("home", { Error: "" });
})

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
        //error la url ya existe
        res.render("Error", { Error: "Error: la Url no ha sido acortada aun" });
    } else {
        console.log("Moriste compa");
        res.redirect("/");
    }


});

app.get("/Success:nuevaUrl", function (req, res) {
    res.render("success", { nuevaUrl: ("HyperSend.herokuapp.com/url/" + req.params.nuevaUrl) });

})

app.get("/url/:urlshort", function (req, res) {

    Url.findOne({ short: req.params.urlshort }, function (err, foundUrl) {
        if (foundUrl != null) {
            res.redirect(foundUrl.full);
        } else {
            res.redirect("/Home/" + "Error3");
        }
    })
})

app.post("/", function (req, res) {

    let InputURL = req.body.Url;

    console.log("URL sin modificar: " + InputURL);

    InputURL = HandleURL(InputURL);

    console.log(InputURL);




    Url.findOne({ full: req.body.Url }, function (err, foundUrl) {
        if (foundUrl != null) {
            res.redirect("/Success" + foundUrl.short);

        }
        else {

            let url = new Url({
                full: req.body.Url,
                short: InputURL
            });
            console.log(url);
            url.save(function (err) {
                if (err) {
                    console.log("Error: La URL no pudo ser almacenada en la base de datos");
                    res.redirect("/Home/" + "Error1");

                } else {

                    res.redirect("/Success" + InputURL);

                }
            });
        }
    })




});
//Funciones----------------------------------------------------------------------------------------

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


function HandleURL(URL) {
    URL = URL.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
    console.log("HANDLEURL: URL sin caracteres especiales: " + URL);
    URL = URL.shuffle();
    console.log("HANDLEURL: URL Shuffled: " + URL);
    URL = URL.substring((URL.length - 5), URL.length);
    console.log("HANDLEURL: URL Recortado: " + URL);
    return URL;
}
//--------------------------------------------Listen en los puertos-------------------------------------

let port = process.env.PORT
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server running on port " + port);

});