import express from "express";

const app = express(); //Nos va a permitir crear el servidor

app.listen(3000) // lo que decimos es que se va a ejecutar en el puerto 3000

app.get('/', (req, res) => { //Cuando el usuario entre a la ruta principal, le vamos a responder con un mensaje
    res.send('Hello World')
})

console.log('Server on port', 3000)