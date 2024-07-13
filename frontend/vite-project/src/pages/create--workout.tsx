import { useState } from 'react'
import Dropdown from '../components/Dropdown'

export default function CreateWorkout() {

    const [workoutName, setWorkoutName] = useState('');

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const {value} = e.target
        setWorkoutName(value)
      }
    

    return (
        <div className="background">
            <div className="form">
                <h1>My Workouts</h1>
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