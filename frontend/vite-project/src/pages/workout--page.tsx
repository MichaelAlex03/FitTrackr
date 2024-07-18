import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Workout {
    workout_name: string;
}

export default function WorkoutPage() {

    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState<Workout[]>([]);

    const navigateToCreateWorkout = () => {
        navigate('/create-workout');
    };

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/workouts');
                setWorkouts(response.data);
            } catch (error) {
                console.error('Error fetching workouts:', error);
            }
        };

        fetchWorkouts();
    }, []);

    console.log(workouts)

    return (
        <div className="background">
            <div className="relative content">
                <h1 className="absolute top-5 left-5 text-2xl font-bold">My Workouts</h1>
                <button className=" absolute submit top-24 w-5/6" onClick={navigateToCreateWorkout}>Create a new workout</button>
                <div className="flex flex-col items-center mt-8 w-full">
                {workouts.map((workout) => (
                        <button className="workouts">{workout.workout_name}</button>
                    ))}
                </div>
            </div>
        </div>
    )
}