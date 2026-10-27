const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

const port = 3000;

app.use(express.json());
app.use(cors());

//Host, user, password database
const connection = mysql.createConnection({
    //process.env.KEYWORD
    host: "localhost",
    user: "root",
    password: "REMOVED_SECRET",
    database: "pokemon"
});


app.get('/trainers', (req, res) =>{
    connection.query("SELECT * FROM trainer", (error, results) => {
res.send(results)
    });

})
app.get('/trainerpokemon/:trainer_id', (req,res) =>{
    const trainerId = req.params.trainer_id;
    connection.query("SELECT * FROM trainer_pokemon inner join trainer on trainer_pokemon.trainer_id=trainer.trainer_id inner join pokemon on trainer_pokemon.pokedex_number=pokemon.pokedex_number WHERE trainer.trainer_id=?", [trainerId], (error, results) => {
        res.send(results)
    });
});

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


app.listen(port, () =>{
    console.log(`Application is now running on port ${port}`);
});
