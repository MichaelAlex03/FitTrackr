import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface Exercise {
    id: number;
    exercise_name: string;
}

export default function CreateWorkout() {

    const navigate = useNavigate();
    const [workoutName, setWorkoutName] = useState('');

    const [isOpen, setIsOpen] = useState(false);
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

    function toggleDropdown() {
        setIsOpen(!isOpen);
    };

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

    async function handleCreateWorkout(){
        try {
            const token = localStorage.getItem("token")
            if(!token){
                return;
            }

            const decodedToken: any = jwtDecode(token);
            const userId = decodedToken.user_id;

            const response = await axios.post('http://localhost:3000/workouts', {
                workout_name: workoutName, 
                exercises: selectedExercises, 
                user_id: userId
            });
            if(response.data.success){
                navigateToWorkoutPage();
            }else{
                console.log('Error creating workout');
            }
            console.log(response)
        } catch (error) {
            console.error('Error creating workout:', error);
        }
    }


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
                onClick={toggleDropdown}
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
            </div>
        </div>
    )
}