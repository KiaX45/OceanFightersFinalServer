import express from "express";
import { config } from "dotenv";
import pg from "pg";
import cors from "cors";
import bcrypt from "bcrypt";

const app = express(); //Nos va a permitir crear el servidor

app.use(cors()); //Nos va a permitir que el servidor acepte peticiones de cualquier origen

config(); //Nos va a permitir leer las variables de entorno
console.log("Cadena de conexión a la base de datos:", process.env.Database_Url);

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


// Asegúrate de que express pueda parsear el cuerpo de las solicitudes JSON
app.use(express.json());

//vamos a crear un ENDPOINT para crear usuarios
app.post("/AnadirUsuarios", async (req, res) => {
  try {
    //primero vamos a obtener los datos del usuario y los vamos a guardar en variables
    const { imagen, email, username, contraseña, esAdministrador } = req.body;

    // Validar que los campos necesarios estén presentes
    if (!email || !username || !contraseña) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    //validar si la contraseña tiene al menos 8 caracteres
    if (contraseña.length < 8) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 8 caracteres" });
    }

    // Verificar si el email o el username ya están en uso
    const emailExistente = await pool.query(
      "SELECT email FROM usuarios WHERE email = $1",
      [email]
    );
    const usernameExistente = await pool.query(
      "SELECT username FROM usuarios WHERE username = $1",
      [username]
    );

    if (emailExistente.rows.length > 0) {
      return res.status(400).json({ error: "El email ya está en uso" });
    }

    if (usernameExistente.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario ya está en uso" });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

    // Guardar el usuario en la base de datos
    const result = await pool.query(
      "INSERT INTO usuarios (imagen, email, username, contraseña, esAdministrador) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [imagen, email, username, contraseñaHasheada, esAdministrador]
    );

    // Devolver el usuario creado
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al guardar el usuario:", error);
    res.status(500).json({ error: "Error al guardar el usuario" });
  }
});


console.log("Server on port", 3000);
