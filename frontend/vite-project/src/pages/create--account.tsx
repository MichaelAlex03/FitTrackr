import { useState} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreateAccount() {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPass: ""
  })

  console.log(formData)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const {name, value} = e.target
    setFormData(prevFormData => {
      return {
        ...prevFormData,
        [name]: value
      }
    })
  }

  async function checkEmailExists(email: string) {
    try {
      const response = await axios.get(`http://localhost:3000/check-email?email=${email}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (formData.password === formData.confirmPass) {
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        alert('Email already exists!');
        return;
      }
      console.log('Passwords match! Logged in');
      try {
        const response = await axios.post('http://localhost:3000/create-account', 
        { email: formData.email, password: formData.password, firstName: formData.firstName, lastName: formData.lastName });  
        if (response.data.success) {
          console.log('User logged in and added to database');
          navigateToWorkout();
        } else {
          console.log('Login failed');
        }
        console.log(response.data.success)
      } catch (error) {
        console.error('Error logging in:', error);
      }
    } else {
      alert('Passwords do not match!');
    }
  }

  const navigate = useNavigate();

  const navigateToWorkout = () => {
      navigate('/workout');
  };

return (
    <div className="background">
      <form className='form' onSubmit={handleSubmit}>
      <h1 className='text-2xl font-bold text-center mb-5'>Create your account</h1>
        <input className='form--input'
            type="text" 
            placeholder="First name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
        />
        <input className='form--input'
            type="text" 
            placeholder="Last name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
        />
        <input className='form--input'
            type="email" 
            placeholder="Email address"
            name="email"
            value={formData.email}
            onChange={handleChange}
        />
        <input className='form--input'
            type="password" 
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
        />
        <input className='form--input'
            type="password" 
            placeholder="Confirm password"
            name="confirmPass"
            value={formData.confirmPass}
            onChange={handleChange}
        />
        <div className='flex items-center justify-center'>
          <button className='submit mt-2' >
              Sign up
          </button>
        </div>  
      </form>
    </div>
  )
}