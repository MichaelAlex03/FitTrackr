import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Workout {
    workout_name: string;
    id: number;
}

export default function WorkoutPage() {

    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState<Workout[]>([]);

    const navigateToCreateWorkout = () => {
        navigate('/create-workout');
    };

    const navigateToWorkoutView = (id:number) => {
        navigate(`/workout--view/${id}`);
    };

    const navigateToWelcome = () => {
        navigate('/')
    }

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/workouts', {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem("token")}`
                    }
                  });
                setWorkouts(response.data);
            } catch (error) {
                console.error('Error fetching workouts:', error);
            }
        };

        fetchWorkouts();
    }, []);

    async function removeWorkout(workoutToRemove: Workout) {
        setWorkouts(workouts.filter(workout => workout !== workoutToRemove));

        console.log(workoutToRemove.id);
        try{
            const deleteSets = await axios.delete(`http://localhost:3000/workout_sets/${workoutToRemove.id}`);
            console.log(deleteSets.data);
            if(deleteSets.data.success){
                const deleteExercises = await axios.delete(`http://localhost:3000/workout_exercises/${workoutToRemove.id}`);
                console.log(deleteExercises.data)
                if(deleteExercises.data.success){
                    const deleteWorkout = await axios.delete(`http://localhost:3000/workouts/${workoutToRemove.id}`);
                    console.log(deleteWorkout.data)
                }
            } else {
                console.log("could not delete sets");
            }
        }
        catch (error) {
            console.error('Error deleting workout:', error);
        }

    }



    console.log(workouts)

    return (
        <div className="background">
            <div className="relative content flex flex-col">
                <h1 className="absolute top-5 left-5 text-2xl font-bold">My Workouts</h1>
                <button className=" absolute submit top-24 w-5/6" onClick={navigateToCreateWorkout}>Create a new workout</button>
                <div className="flex flex-col items-center mt-24 w-full overflow-y-auto max-h-[450px]">
                {workouts.map((workout) => (
                        <div className="flex w-5/6 mb-2 gap-2">
                            <button key={workout.id} className="workouts flex-grow" onClick={() => navigateToWorkoutView(workout.id)}>{workout.workout_name}</button>
                            <button key={workout.workout_name} onClick={() => removeWorkout(workout)} className="workouts delete w-12 h-12 flex items-center justify-center"><img src="../images/trash.webp" alt="trash" className='w-6 h-6'/></button>
                        </div>
                    ))}
                </div>
                <button className='submit bg-gray-300 w-1/2 absolute bottom-4 left-1/2 transform -translate-x-1/2' onClick={navigateToWelcome}>Sign out</button>
            </div>
        </div>
    )
}