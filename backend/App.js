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
        req.userId = decoded.userId
        console.log("Verified JWT: userId =", req.userId); // Add this line for debugging
        console.log(req.userId);
        next()
      }
    })
  }
}

app.get("/exercises", async (req, res) => {
    const result = await db.query('SELECT * FROM exercises')
    res.json(result.rows)
    console.log(result.rows)
})

app.get("/user_exercises/:id", verifyJWT, async (req, res) => {
  const workout_id = req.params.id;
  const result = await db.query('SELECT * FROM user_exercises WHERE workout_id = $1', [workout_id]);
  res.json({rows: result.rows, success: true});
})

app.get("/workouts", verifyJWT, async(req, res) => {
  const userId = req.userId;
  console.log("Fetching workouts for userId:", userId);
  const result = await db.query('SELECT * FROM workouts WHERE user_id = $1', [userId])
  res.json(result.rows)
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

app.get("/sets/:id", verifyJWT, async (req, res) => {
  try{
    const result = await db.query('SELECT * FROM workout_sets WHERE workout_id = $1', [req.params.id]);
    console.log("sets: " + JSON.stringify(result.rows));
    res.json({rows: result.rows, success: true})
  }catch (error) {
    console.error('Error getting set data:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

// app.post("/user_workouts/:id", verifyJWT, async (req, res) => {
//   const workout_id = req.params.id
//   const {exercises } = req.body;
//   try{
//     const insertExercises = exercises.map(exercise => {
//       const { reps, weight } = exercise;
//       db.query('INSERT INTO user_exercises (exercise_reps, exercise_weight, workout_id) VALUES ($1, $2, $3),'
//       [reps, weight, workout_id]);
//     })
//     res.send({success: true});
//   }catch(error){
//     console.error('Error posting data:', error);
//     res.status(500).send({ success: false, message: 'Internal Server Error' });
//   }
// })

app.post("/create_sets", verifyJWT, async (req, res) => {
  try{
      const result = await db.query('INSERT INTO workout_sets (exercise_id, exercise_reps, exercise_weight, workout_id) VALUES ($1, $2, $3, $4) RETURNING *', 
        [req.body.exercise_id, req.body.reps, req.body.weight, req.body.workout_id]);

        console.log('New set created:', result.rows[0]); 
        res.status(201).json({ success: true, newSet: result.rows[0] });
  } catch(error){
    console.error('Error inserting set', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.post("/workouts", verifyJWT, async (req, res) => {
  try{
    const userId = req.userId;
    const result = await db.query('INSERT INTO workouts (workout_name, user_id) VALUES ($1, $2) RETURNING id', [req.body.workout_name, userId]);
    res.send({success: true, user_id: userId, workout_id: result.rows[0].id});
  } catch (error) {
    console.error('Error inserting workout:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.post("/create_exercises", verifyJWT, async (req, res) => {
  const {exercises } = req.body;
  try{
    const insertExercises = exercises.map(exercise => {
      const { workout_id, exercise_name, sets } = exercise;
      db.query('INSERT INTO user_exercises ( exercise_name, workout_id, workout_sets) VALUES ($1, $2, $3)', 
      [exercise_name, workout_id, sets]);
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
      const token = jwt.sign({ userId: id }, 'secret', {
        expiresIn: '1h'
      })
      console.log("Login: Token payload:", jwt.decode(token));
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
      const query = 'INSERT INTO users (first_name, last_name, user_email, user_pass) VALUES ($1, $2, $3, $4) RETURNING id';
      const result = await db.query(query, [firstName, lastName, email, password]);

      const id = result.rows[0].id
      const token = jwt.sign({ userId: id }, 'secret', {
        expiresIn: '1h'
      })
      console.log("Create Account: Token payload:", jwt.decode(token))
      res.json({
        auth: true, 
        token: token, 
        success: true,
        userId: id,
        message: 'User logged in successfully'
      })
      // res.status(201).send({success: true, message: 'User created successfully'});
  } catch (error) {
      console.error('Error inserting user:', error);
      res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

app.delete('/workout_sets/:id', async (req, res) => {
  const workout_id = req.params.id;
  try{
    await db.query('DELETE FROM workout_sets WHERE workout_id = $1' , [workout_id]);
    res.status(200).send({success: true, message: 'sets deleted'});
  }catch(error){
    console.error('Error inserting user:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.delete('/workout_exercises/:id', async (req, res) => {
  const workout_id = req.params.id;
  try{
    await db.query('DELETE FROM user_exercises WHERE workout_id = $1' , [workout_id]);
    res.status(200).send({success: true, message: 'exercises deleted'});
  }catch(error){
    console.error('Error inserting user:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.delete('/workouts/:id', async (req, res) => {
  const workout_id = req.params.id;
  try{
    await db.query('DELETE FROM workouts WHERE id = $1' , [workout_id]);
    res.status(200).send({success: true, message: 'workouts deleted'});
  }catch(error){
    console.error('Error inserting user:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.delete('/set/:id', async (req, res) => {
  const setId = req.params.id
  try {
    await db.query('DELETE FROM workout_sets WHERE id = $1', [setId]);
    res.status(200).send({success: true, message: 'set deleted'});
  } catch (error) {
    console.error('Error deleting set:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  