import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";

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

app.get("/", (req, res) => {
    res.send('Hello from the backend!');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body

  try{
    const result = await db.query('SELECT user_pass FROM users WHERE user_email = $1', [email])
    console.log(result.rows)
    if(result.rows.length === 0){
      return res.send({success: false, message: 'User not found'})
    }
    else if(result.rows[0].user_pass !== password){
      return res.send({success: false, message: 'Invalid password'})
    }
    else{
      return res.send({success: true, message: 'User logged in successfully'})
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
  