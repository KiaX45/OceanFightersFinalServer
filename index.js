import express from "express";
import { config } from "dotenv";
import pg from "pg";
import cors from "cors";

const app = express(); //Nos va a permitir crear el servidor

app.use(cors()); //Nos va a permitir que el servidor acepte peticiones de cualquier origen

config(); //Nos va a permitir leer las variables de entorno

const pool = new pg.Pool({
  connectionString: process.env.Database_Url,
  //ssl: true,
});

app.listen(3000); // lo que decimos es que se va a ejecutar en el puerto 3000

app.get("/", (req, res) => {
  //Cuando el usuario entre a la ruta principal, le vamos a responder con un mensaje
  res.send("Hello World");
});

app.get("/ping", async (req, res) => {
  //Cuando el usuario entre a la ruta ping, le vamos a responder con un mensaje

  //hacemos una consulta de la fecha actual de la base de datos
  const result = await pool.query("SELECT NOW()");

  return res.json(result.rows[0]);
});

//Funciones para crear tablas
app.get("/create-tables", async (req, res) => {
  try {
    const query = `
    CREATE TABLE IF NOT EXISTS usuarios (
    uidUsuario SERIAL PRIMARY KEY,
    imagen VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    esAdministrador BOOLEAN NOT NULL DEFAULT FALSE
);
    `;
    await pool.query(query);
    res.send("Tabla usuarios creada");
  } catch (error) {
    console.error("Error al crear la tabla:", error);
    res.status(500).send("Error al crear la tabla");
  }
});

console.log("Server on port", 3000);
