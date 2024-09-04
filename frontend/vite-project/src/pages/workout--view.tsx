import { useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dropdown from '../components/Dropdown/Dropdown';
import DropdownItem from '../components/DropdownItem/DropdownItem';


interface Exercise {
    id: number;
    exercise_name: string;
}

interface Sets{
    id: number;
    workout_sets: number;
    exercise_reps: number;
    exercise_weight: number;
    exercise_id: number;
}

export default function WorkoutView() {

    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [exerciseSets, setExerciseSets] = useState<Sets[]>([]);

    const options: string[] = ["Replace Exercise", "View Exercise History"];


    useEffect(() => {
        const fetchExercises = async () => {
            const token = localStorage.getItem("token")
            if(!token){
                return;
            }
            try {
                const response = await axios.get(`http://localhost:3000/user_exercises/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log(response.data.success)
                if(response.data.success)
                {
                    const setsData = await axios.get(`http://localhost:3000/sets/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setExerciseSets(setsData.data.rows);
                    console.log(setsData.data.rows);
                    console.log(id)
                }
                setExercises(response.data.rows);
            } catch (error) {
                console.error('Error fetching exercises:', error);
            }
        };

        fetchExercises();
    },[]);


    const renderSets = (sets: Sets[]) => {
        return sets.map((set, index) => (
            <div key={set.id} className="flex flex-wrap items-center gap-2 mb-5">
                <label htmlFor="sets" className="mr-1">Set</label>
                <button name="sets" className="w-5 rounded-md bg-white font-bold p-0 mr-3">{index + 1}</button>

                <label htmlFor="reps" className="mr-1"> Reps </label>
                <input type="text" 
                    name="reps" 
                    className="w-10 rounded-md mr-3 pl-1" 
                    value={set.exercise_reps}  
                    onChange={(e) => handleRepsChange(e, set.id)}
                />

                <label htmlFor="weight" className="mr-1"> Weight </label>
                <input type="text" 
                    name="weight" 
                    className="w-10 rounded-md pl-1" 
                    value={set.exercise_weight}  
                    onChange={(e) => handleWeightChange(e, set.id)}
                />

                <button className="submit delete ml-auto hover:bg-blue-600" onClick={() => removeSet(set.id)}>
                    <img src="../images/trash.webp" alt="trash"/>
                </button>
            </div>
        ));
    }

  console.log(exercises);

   const addSet = async (exercise: Exercise) => {

        const token = localStorage.getItem("token")
        if(!token){
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/create_sets', {
                exercise_name: exercise.exercise_name,
                exercise_id: exercise.id,
                workout_id: id,
                reps: 0,
                weight: 0
            } , {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Server response:', response.data);
        
            if(response.data.success){
                setExerciseSets(prevSets => [...prevSets, response.data.newSet]);
            }
            
        } catch (error) {
            console.error('Error adding set', error);
        }    
    }

    const removeSet = async (setId: number) => {
        const token = localStorage.getItem("token")
        if(!token){
            return;
        }

        try {
            const response = await axios.delete(`http://localhost:3000/set/${setId}`);

            console.log('Server response:', response.data);
        
            if(response.data.success){
                setExerciseSets(prevSets => prevSets.filter(set => set.id != setId));
            }
            
        } catch (error) {
            console.error('Error adding set', error);
        }    
    }

    const navigateToWorkoutPage = () => {
        navigate('/workout');
    };
    
    const viewExerciseHistory = (exercise: Exercise) => {
        const exercise_name = encodeURIComponent(exercise.exercise_name);
        console.log(exercise_name);
        const url = `/workout-history/${id}/${exercise_name}`;
        navigate(url);
    }

    const finishWorkout = async () => {
        try{
            const token = localStorage.getItem("token")
            if(!token){
                return;
            }

            console.log("Sending exerciseSets:", exerciseSets); // Log the data being sent

            const response = await axios.patch(`http://localhost:3000/user_sets`, {
                sets: exerciseSets
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if(response.data.success){
                navigateToWorkoutPage();
            } else {
                console.log("error adding data to table");
            }
        }catch(error) {
            console.error('Error sending data: please work', error);
        }
    }

    const handleOptionClick = (option: string, exercise: Exercise) => {
        if (option === "Replace Exercise") {
            // Handle replace exercise
        } else if (option === "View Exercise History") {
            viewExerciseHistory(exercise);
        }
    };


    function handleRepsChange(e: React.ChangeEvent<HTMLInputElement>, setId: number) {
        const { value } = e.target;
        console.log(e.target);
        console.log(setId)
        setExerciseSets(prevSets => prevSets.map(set => 
            set.id === setId ? { ...set, exercise_reps: Number(value) } : set
        ));
        
    }

    function handleWeightChange(e: React.ChangeEvent<HTMLInputElement>, setId: number) {
        const { value } = e.target;
        setExerciseSets(prevSets => prevSets.map(set => 
            set.id === setId ? { ...set, exercise_weight: Number(value) } : set
        ));
        
    }

    return (
        <div className = "background">
            <div className = "content xs:w-5/6 lg:w-1/2">
                <div className='max-h-[100vh] overflow-y-auto flex flex-col items-center'>
                    {exercises.map((exercise) => {
                        const exerciseSetsFiltered = exerciseSets.filter(set => set.exercise_id === exercise.id);
                        return (
                            <div key={exercise.id} className="mb-8 p-4 border rounded bg-gray-50  xs:w-5/6">
                                <div className='flex mb-4'>
                                    <h2 className="text-xl font-semibold mb-4 mr-auto">{exercise.exercise_name}</h2>
                                    <Dropdown buttonText="Dropdown button"
                                    content = {<>
                                        {options.map(option => (
                                            <DropdownItem key={option} onClick={() => handleOptionClick(option, exercise)}>
                                                {option}
                                            </DropdownItem>
                                         ))}
                                    </>
                                    }/>
                                </div>
                                {renderSets(exerciseSetsFiltered)}
                                <button className="submit mt-4 p-1" onClick={() => addSet(exercise)}>Add Set</button>
                            </div>
                        );
                    })}
                </div>
                <button className='submit mt-2' onClick={finishWorkout}>Finish Workout</button>
                <button className="submit bg-gray-300" onClick={navigateToWorkoutPage}>Return to Workouts</button>
            </div>
        </div>
    )
}



