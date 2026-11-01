require("dotenv").config();

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(express.json());
app.use(cors());

const port = 3000;

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


//Alle trainers
app.get('/trainers', (req, res) =>{
    connection.query("SELECT * FROM trainer", (error, results) => {
        res.send(results)
    });

})
//Søge på en træners id
app.get('/trainerpokemon/:trainer_id', (req,res) =>{
    const trainerId = req.params.trainer_id;
    connection.query("SELECT * FROM trainer_pokemon inner join trainer on trainer_pokemon.trainer_id=trainer.trainer_id inner join pokemon on trainer_pokemon.pokedex_number=pokemon.pokedex_number WHERE trainer.trainer_id=?", [trainerId], (error, results) => {
        res.send(results)
    });
});

//Oprette en ny træner
app.post('/new/trainer', (req, res) =>{
    const trainer_name = req.body.trainer_name
    const hometown = req.body.hometown
    const age = req.body.age

    connection.query(
        "INSERT INTO trainer (trainer_name, hometown, age) VALUES (?, ?, ?)",
        [trainer_name, hometown, age],
        (error, results) => {
            if (error) {
                return res.send(error.message)
            }
            res.send("Trainer created successfully!");
        })
});

//Tilføje en allerede eksisterende pokemon, til en træner.
app.post("/trainer/pokemon/new", (req, res) => {
    const trainerId = req.body.trainer_id;
    const pokedexNumber = req.body.pokedex_number;

    connection.query(
        "INSERT INTO trainer_pokemon (trainer_id, pokedex_number) VALUES (?, ?)",
        [trainerId, pokedexNumber],
        (error, results) => {
            if (error) {
                return res.status(500).send(error.message);
            }

            res.send("Pokemon added to trainer");
        });
});

//Søge på en træners navn
app.get('/trainer/:trainer_name', (req,res) =>{
    const trainerName = req.params.trainer_name;
    connection.query('SELECT * FROM trainer WHERE trainer.trainer_name LIKE ?',
        [`%${trainerName}%`], (error, results) => {
        res.send(results)
    });

});

app.get("/pokemon", (req, res) => {

    let sql = "SELECT * FROM pokemon WHERE 1=1";
    let values = [];

    if (req.query.type) {
        sql += " AND primary_type = ?";
        values.push(req.query.type);
    }

    if (req.query.name) {
        sql += " AND name LIKE ?";
        values.push("%" + req.query.name + "%");
    }

    if (req.query.minAttack) {
        sql += " AND attack >= ?";
        values.push(req.query.minAttack);
    }


    connection.query(sql, values, (error, results) => {
        if (error) {
            return res.status(500).send(error.message);
        }

        res.json(results);
    });
});


app.get("/evolutions", (req, res) => {

    const sql = `
        SELECT
            before_evolution.pokedex_number AS from_number,
            before_evolution.name AS from_pokemon,
            after_evolution.pokedex_number AS to_number,
            after_evolution.name AS to_pokemon

        FROM evolution

        JOIN pokemon AS before_evolution
            ON evolution.from_pokedex_number = before_evolution.pokedex_number

        JOIN pokemon AS after_evolution
            ON evolution.to_pokedex_number = after_evolution.pokedex_number
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).send(error.message);
        }

        res.json(results);
    });
});

app.get('/stats/type-distribution', (req, res) => {
    const sql = `
        SELECT
            primary_type AS type,
            COUNT(*) AS antal
        FROM pokemon
        GROUP BY primary_type
        ORDER BY antal DESC
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(results);
    });
});


app.get('/stats/average-attack', (req, res) => {
    const sql = `
        SELECT
            primary_type AS type,
            ROUND(AVG(attack), 2) AS gennemsnitlig_attack
        FROM pokemon
        GROUP BY primary_type
        ORDER BY gennemsnitlig_attack DESC
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(results);
    });
});
app.get('/stats/top-trainers', (req, res) => {
    const sql = `
        SELECT
            trainer.trainer_id,
            trainer.trainer_name,
            COUNT(trainer_pokemon.trainer_id) AS antal_pokemon
        FROM trainer
                 LEFT JOIN trainer_pokemon
                           ON trainer.trainer_id = trainer_pokemon.trainer_id
        GROUP BY trainer.trainer_id, trainer.trainer_name
        ORDER BY antal_pokemon DESC
    `;

    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(results);
    });
});

app.get("/stats/fastest-pokemon", (req, res) => {
    const sql = `
       SELECT name, speed
       FROM pokemon
       WHERE speed IS NOT NULL
       ORDER BY speed DESC, name ASC
       LIMIT 10
   `;

    connection.query(sql, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(results);
    });
});

app.listen(port, () =>{
    console.log(`Application is now running on port ${port}`);
});


app.listen(port, () =>{
    console.log(`Application is now running on port ${port}`);
});
