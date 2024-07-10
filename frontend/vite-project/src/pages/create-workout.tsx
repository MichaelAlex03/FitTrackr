import { useState } from 'react'

export default function CreateWorkout() {

    const [workoutName, setWorkoutName] = useState('');
    const [workoutDescription, setWorkoutDescription] = useState('');
    const [workoutExercises, setWorkoutExercises] = useState([]);

    return (
        <div className="background">
            <div className="form">
                <h1>My Workouts</h1>
            </div>
        </div>
    )
}