import { useState } from 'react'
import Dropdown from '../components/Dropdown'
import axios from 'axios';

export default function CreateWorkout() {

    const [workoutName, setWorkoutName] = useState('');

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const {value} = e.target
        setWorkoutName(value)
      }

    async function handleCreateWorkout(){
        try {
            const response = await axios.post('http://localhost:3000/exercises');
        } catch (error) {
            console.error('Error fetching exercises:', error);
        }
    }
    

    return (
        <div className="background">
            <div className="form w-1/2 h-2/3" >
                <input className='form--input'
                    type="text" 
                    placeholder="Workout Name"
                    name="workoutName"
                    value={workoutName}
                    onChange={handleChange}
                />
                <Dropdown />
                <button className="submit">Create Workout</button>
            </div>
        </div>
    )
}