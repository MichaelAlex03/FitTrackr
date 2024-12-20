const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const jwt = require('jsonwebtoken');
const { logger } = require('./middleware/logEvents');
const path = require('path');
const pool = require('./config/dbConn');
const verifyJWT = require('./middleware/verifyJWT');
const PORT = process.env.PORT || 3000;

const app = express();


//logs requests made to server
app.use(logger);

//handle form data
app.use(express.urlencoded({extended : true}));

//handle json request
app.use(express.json());

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

//serve static files
app.use(express.static(path.join(__dirname, 'public')));

//server front end through backend will build frontend and place here in backend
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
// });

// //put auth routes here before verifyJWT
// app.use('/auth/register', require('./routes/auth/register'));
// app.use('/auth/login', require('./routes/auth/login'));
// app.use('/auth/refresh', require('./routes/auth/refresh'));
// app.use('/auth/logout', require('./routes/auth/logout'));

// app.use(verifyJWT);

//put all api routes after verifyJWT




app.get("/exercises", async (req, res) => {
    const result = await pool.query('SELECT * FROM exercises')
    res.json(result.rows)
    console.log(result.rows)
})

app.get("/user_exercises/:id", verifyJWT, async (req, res) => {
  const workout_id = req.params.id;
  const result = await pool.query('SELECT * FROM user_exercises WHERE workout_id = $1', [workout_id]);
  res.json({rows: result.rows, success: true});
})

app.get("/workouts", verifyJWT, async(req, res) => {
  const userId = req.userId;
  console.log("Fetching workouts for userId:", userId);
  const result = await pool.query('SELECT * FROM workouts WHERE user_id = $1', [userId])
  res.json(result.rows)
  console.log(result.rows)
})

app.get("/check-email", async (req, res) => {
  const { email } = req.query;
  try{
    const result = await pool.query('SELECT 1 FROM users WHERE user_email = $1', [email]);
    res.send({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.get("/sets/:id", verifyJWT, async (req, res) => {
  try{
    const result = await pool.query('SELECT * FROM workout_sets WHERE workout_id = $1', [req.params.id]);
    console.log("sets: " + JSON.stringify(result.rows));
    res.json({rows: result.rows, success: true})
  }catch (error) {
    console.error('Error getting set data:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.get("/exercise_history/:id/:exercise_name", verifyJWT, async(req, res) => {
  const userId = req.userId

  const exercise_name = req.params.exercise_name;

  try{
    const result = await pool.query('SELECT * FROM workout_sets WHERE exercise_name = $1 AND user_id = $2', [exercise_name, userId]);
    res.json({result: result.rows, success: true});
  }catch (error) {
    console.error('Error getting exercise history:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.post("/create_sets", verifyJWT, async (req, res) => {
  
  const userId = req.userId

  try{
      const result = await pool.query('INSERT INTO workout_sets (exercise_id, exercise_reps, exercise_weight, workout_id, exercise_name, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
        [req.body.exercise_id, req.body.reps, req.body.weight, req.body.workout_id, req.body.exercise_name, userId]);

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
    const result = await pool.query('INSERT INTO workouts (workout_name, user_id) VALUES ($1, $2) RETURNING id', [req.body.workout_name, userId]);
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
      pool.query('INSERT INTO user_exercises ( exercise_name, workout_id, workout_sets) VALUES ($1, $2, $3)', 
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
  console.log(req.body);

  try{
    const result = await pool.query('SELECT * FROM users WHERE user_email = $1', [email])
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
  const { firstName, password } = req.body;
  
  console.log(firstName, password)

  try {
      const query = 'INSERT INTO users (first_name, last_name, user_email, user_pass) VALUES ($1, $2) RETURNING id';
      const result = await pool.query(query, [firstName, password]);
      res.status(201).json({success: true, message: 'User created successfully'});
  } catch (error) {
      console.error('Error inserting user:', error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


app.patch("/user_sets", verifyJWT, async (req, res) => {

  const {sets } = req.body;
  try{
    const updatePromises = sets.map(set => {
      const { exercise_reps, exercise_weight, id } = set;
      console.log(id);
      return pool.query(
        'UPDATE workout_sets SET exercise_reps = $1, exercise_weight = $2 WHERE id = $3',
        [exercise_reps, exercise_weight, id]
      );
    });

    await Promise.all(updatePromises);
    res.send({success: true});
  }catch(error){
    console.error('Error posting data:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.delete('/workout_sets/:id', async (req, res) => {
  const workout_id = req.params.id;
  try{
    await pool.query('DELETE FROM workout_sets WHERE workout_id = $1' , [workout_id]);
    res.status(200).send({success: true, message: 'sets deleted'});
  }catch(error){
    console.error('Error inserting user:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.delete('/workout_exercises/:id', async (req, res) => {
  const workout_id = req.params.id;
  try{
    await pool.query('DELETE FROM user_exercises WHERE workout_id = $1' , [workout_id]);
    res.status(200).send({success: true, message: 'exercises deleted'});
  }catch(error){
    console.error('Error inserting user:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.delete('/workouts/:id', async (req, res) => {
  const workout_id = req.params.id;
  try{
    await pool.query('DELETE FROM workouts WHERE id = $1' , [workout_id]);
    res.status(200).send({success: true, message: 'workouts deleted'});
  }catch(error){
    console.error('Error inserting user:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.delete('/set/:id', async (req, res) => {
  const setId = req.params.id
  try {
    await pool.query('DELETE FROM workout_sets WHERE id = $1', [setId]);
    res.status(200).send({success: true, message: 'set deleted'});
  } catch (error) {
    console.error('Error deleting set:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})

app.delete('/user_exercises/:id', async (req, res) => {
  const exerciseId = req.params.id;
  try{
    await pool.query('DELETE FROM user_exercises WHERE id = $1' , [exerciseId]);
    res.status(200).send({success: true, message: 'exercises deleted'});
  }catch(error){
    console.error('Error inserting user:', error);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
})



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  