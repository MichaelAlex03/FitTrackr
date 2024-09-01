import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Exercise {
    id: number;
    exercise_name: string;
}

export default function CreateWorkout() {

    const navigate = useNavigate();
    const [workoutName, setWorkoutName] = useState('');

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

    const navigateToWorkoutPage = () => {
        navigate('/workout');
    };

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const response = await axios.get('http://localhost:3000/exercises');
                setExercises(response.data);
            } catch (error) {
                console.error('Error fetching exercises:', error);
            }
        };

        fetchExercises();
    }, []);

    function handleWorkoutChange(event: React.ChangeEvent<HTMLSelectElement>) {
        console.log(event)
        const {value} = event.target
        setSelectedExercise(value)
    }

    function handleAddExercise(){
        if(selectedExercise && !selectedExercises.includes(selectedExercise)){
            setSelectedExercises([...selectedExercises, selectedExercise])
        }
    }

    function handleRemoveExercise(exerciseToRemove: string) {
        setSelectedExercises(selectedExercises.filter(exercise => exercise !== exerciseToRemove));
    };

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const {value} = e.target
        setWorkoutName(value)
      }

    console.log(selectedExercises)

    async function handleCreateWorkout(){
        try {
            const token = localStorage.getItem("token")
            if(!token){
                return;
            }

            const workoutResponse = await axios.post('http://localhost:3000/workouts', {
                workout_name: workoutName, 
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if(workoutResponse.data.success){
                const workout_id = workoutResponse.data.workout_id;

                const exercisesData = selectedExercises.map(exercise => ({
                    workout_id: workout_id,
                    exercise_name: exercise,
                    sets: 0
                }));

                console.log(exercisesData);
                const exercisesResponse = await axios.post('http://localhost:3000/create_exercises', {
                    exercises: exercisesData
                } , {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if(exercisesResponse.data.success){
                    navigateToWorkoutPage();
                }else{
                    console.log('Error adding exercises to user_exercises table');
                }
            }else{
                console.log('Error creating workout');
            }
            console.log(workoutResponse)
        } catch (error) {
            console.error('Error creating workout:', error);
        }
    }

    console.log(selectedExercises)

    return (
        <div className="background">
            <div className="form xl:w-1/2 xl:h-2/3" >
                <input className='form--input'
                    type="text" 
                    placeholder="Workout Name"
                    name="workoutName"
                    value={workoutName}
                    onChange={handleChange}
                />
                <div className="w-full">
            <select
                className="submit rounded bg-gray-300"
                onChange={handleWorkoutChange}
            >
                <option value="">---Add Exercises---</option>
                {exercises.map(exercise => (
                    <option
                        key={exercise.id}
                        value={exercise.exercise_name}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >  
                        {exercise.exercise_name}
                    </option>
                ))}
            </select>
            <div className="create-workout">
                <ul>
                    {selectedExercises.map((exercise, index) => (
                        <li key={index} className="flex justify-between items-center text-lg text-gray-800 py-2 border-b border-gray-300">
                            {exercise}
                            <button onClick={() => handleRemoveExercise(exercise)} className="submit delete"><img src="../images/trash.webp" alt="trash"/></button>
                        </li>
                    ))}
                        </ul>
                    </div>
                    <button className="submit bg-gray-300" onClick={handleAddExercise}>Add</button>
                </div>
                <button className="submit" onClick={handleCreateWorkout}>Create Workout</button>
                <button className="submit" onClick={navigateToWorkoutPage}>Return to Workouts</button>
            </div>
        </div>
    )
}