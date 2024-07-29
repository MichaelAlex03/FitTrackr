import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "users--workout",
    password: "Alexander03",
    port: 5433,
  });

db.connect();

app.use(bodyParser.json());
app.use(cors());

const verifyJWT = (req, res, next) => {
  const token = req.headers["authorization"]?.split(' ')[1];

  if(!token){
    res.send("Token is required")
  } else{
    jwt.verify(token, "secret", (err, decoded) => {
      if(err){
        res.json({auth: false, message: "You failed to authenticate"})
      } else{
        req.userId = decoded.id
        next()
      }
    })
  }
}

app.get("/exercises", async (req, res) => {
    const result = await db.query('SELECT * FROM exercises')
    res.send(result.rows)
    console.log(result.rows)
})

app.get("/user_exercises/:id", verifyJWT, async (req, res) => {
  const workout_id = req.params.id;
  const result = await db.query('SELECT * FROM user_exercises WHERE workout_id = $1', [workout_id])
  res.send(result.rows)
})

app.get("/workouts", verifyJWT, async(req, res) => {
  const userId = req.userId;
  const result = await db.query('SELECT * FROM workouts WHERE user_id = $1', [userId])
  res.send(result.rows)
  console.log(result.rows)
})

app.get("/check-email", async (req, res) => {
  const { email } = req.query;
  try{
    const result = await db.query('SELECT 1 FROM users WHERE user_email = $1', [email]);
    res.send({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.post("/workouts", verifyJWT, async (req, res) => {
  try{
    const userId = req.userId;
    const result = await db.query('INSERT INTO workouts (workout_name, user_id) VALUES ($1, $2) RETURNING id', [req.body.workout_name, userId]);
    res.send({success: true, user_id: userId, workout_id: result.rows[0].id})
  } catch (error) {
    console.error('Error inserting workout:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.post("/create_exercises", verifyJWT, async (req, res) => {
  const {exercises } = req.body;
  try{
    const insertExercises = exercises.map(exercise => {
      const { workout_id, exercise_name, reps, sets, weight } = exercise;
      db.query('INSERT INTO user_exercises (exercise_name, exercise_sets, exercise_reps, workout_id, exercise_weight) VALUES ($1, $2, $3, $4, $5)', 
      [exercise_name, sets,  reps, workout_id, weight]);
    })
    res.send({success: true})
  } catch(error){
    console.error('Error inserting exercise:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})


app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try{
    const result = await db.query('SELECT * FROM users WHERE user_email = $1', [email])
    console.log(result.rows)
    if(result.rows.length === 0){
      res.json({
        auth: false, 
        success: false, 
        message: 'User not found'
      })
    }
    else if(result.rows[0].user_pass !== password){
      res.json({
        auth: false, 
        success: false, 
        message: 'Invalid password'
      })
    }
    else{
      const id = result.rows[0].id
      const token = jwt.sign({ id }, 'secret', {
        expiresIn: '1h'
      })
      res.json({
        auth: true, 
        token: token, 
        success: true, 
        message: 'User logged in successfully'
      })
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }

});


app.post('/create-account', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  console.log(firstName, lastName, email, password)

  try {
      const query = 'INSERT INTO users (first_name, last_name, user_email, user_pass) VALUES ($1, $2, $3, $4)';
      await db.query(query, [firstName, lastName, email, password]);
      res.status(201).send({success: true, message: 'User created successfully'});
  } catch (error) {
      console.error('Error inserting user:', error);
      res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  