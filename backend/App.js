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
  const token = req.headers["x-access-token"]

  if(!token){
    res.send("Yo we need a token, please give it to us next time")
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

// app.get("/isUserAuth", verifyJWT , (req, res) => {
//   res.send("Yo you are authenticated")
// })

app.get("/exercises", async (req, res) => {
    const result = await db.query('SELECT * FROM exercises')
    res.send(result.rows)
    console.log(result.rows)
})

app.get("/workouts", verifyJWT, async(req, res) => {
    const result = await db.query('SELECT * FROM workouts')
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

app.post("/workouts", async (req, res) => {
  const result = await db.query('INSERT INTO workouts (workout_name, user_id) VALUES ($1, $2)', [req.body.workout_name, req.body.user_id]);
  res.send({success: true})
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
  