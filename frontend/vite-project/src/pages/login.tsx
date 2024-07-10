import { useState} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const {name, value} = e.target
    setFormData(prevFormData => {
      return {
        ...prevFormData,
        [name]: value
      }
    })
  }

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try{
      const response = await axios.post('http://localhost:3000/login', formData);
      console.log(response.data.success)
      if (response.data.success) {
        navigateToWorkout();
      } else {
        alert(response.data.message);
      }
    }catch(error){
      console.log(error);
    }
  }

  const navigate = useNavigate();

  const navigateToWorkout = () => {
      navigate('/workout');
  };

return (
    <div className="background">
      <form className='form' onSubmit={handleSubmit}>
      <h1 className='text-2xl font-bold text-center mb-5'>Sign into your account</h1>

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
        <div className='flex items-center justify-center'>
          <button className='submit mt-2'>
              Sign in
          </button>
        </div>  
      </form>
    </div>
  )
}