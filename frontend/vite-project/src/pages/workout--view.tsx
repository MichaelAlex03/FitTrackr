import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Exercise {
    id: number;
    exercise_name: string;
    workout_sets: number;
    exercise_reps: number;
    exercise_weight: number;
    exercise_id: number;
}

export default function WorkoutView() {

    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [exerciseSets, setExerciseSets] = useState<Exercise[]>([]);
    const [totalSets, setTotalSets] = useState(0);


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
    }, [totalSets]);


    const renderSets = (exercise: Exercise) => {
        const setsExercises = [];

        var numberOfSets:number = 0

        //Goes through sets state and counts how many sets for each exercise
        for(let i = 0; i < exerciseSets.length; i++){
            if(exercise.id === exerciseSets[i].exercise_id){
                numberOfSets++
            }
        }

        //Displays sets
        for(let i = 0; i < numberOfSets; i++){
            setsExercises.push(
                <div key={i} className="flex items-center">
                    <label htmlFor="sets" className="mr-1">Set</label>
                    <button name="sets" className="w-5 rounded-md bg-white font-bold p-0 mr-3">{i + 1}</button>

                    <label htmlFor="reps" className="mr-1"> Reps </label>
                    <input type="text" 
                        name="reps" 
                        className="w-10 rounded-md mr-3 pl-1" 
                        placeholder={String(0)}
                        value={0}  
                        // onChange={(e) => handleRepsChange(e, exercise.id)}
                        key={i}
                    />

                    <label htmlFor="weight" className="mr-1"> Weight </label>
                    <input type="text" 
                        name="weight" 
                        className="w-10 rounded-md pl-1" 
                        placeholder={String(0)}
                        value={0}  
                        // onChange={(e) => handleWeightChange(e, exercise.id)}
                    />

                    <button className="submit delete ml-auto"><img src="../images/trash.webp" alt="trash"/></button>
                </div>
            );
        }
        return setsExercises;
    }

  console.log(exercises);

   const addSet = async (exercise: Exercise) => {

        const token = localStorage.getItem("token")
        if(!token){
            return;
        }

        try {
            await axios.post('http://localhost:3000/create_sets', {
                exercise_id: exercise.id,
                workout_id: id,
                reps: 0,
                weight: 0
            } , {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setTotalSets(prevTotal => prevTotal + 1);
            
        } catch (error) {
            console.error('Error adding set', error);
        }    
    }

    const removeSet = (exercise: Exercise) => {
        setExercises(prevExercises => prevExercises.map(ex => 
            ex.id === exercise.id ? { ...ex, exercise_sets: ex.workout_sets - 1 } : ex
        ));
    }

    const navigateToWorkoutPage = () => {
        navigate('/workout');
    };

    const finishWorkout = async () => {
        try{
            const token = localStorage.getItem("token")
            if(!token){
                return;
            }

            const exercisesData = exercises.map(exercise => ({
                reps: exercise.exercise_reps,
                weight: exercise.exercise_weight
            }));

            const response = await axios.post(`http://localhost:3000/user_workouts/${id}`, {
                exercises: exercisesData
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

    function handleRepsChange(e: React.ChangeEvent<HTMLInputElement>, exerciseId: number) {
        const { value } = e.target;
        console.log(e.target);
        setExercises(prevExercises => prevExercises.map(exercise => 
            exercise.id === exerciseId ? { ...exercise, exercise_reps: Number(value) } : exercise
        ));
    }

    function handleWeightChange(e: React.ChangeEvent<HTMLInputElement>, exerciseId: number) {
        const { value } = e.target;
        setExercises(prevExercises => prevExercises.map(exercise => 
            exercise.id === exerciseId ? { ...exercise, exercise_weight: Number(value) } : exercise
        ));
    }

    return (
        <div className = "background">
            <div className = "content xs:w-5/6 lg:w-1/2">
                <div className='max-h-[100vh] overflow-y-auto flex flex-col items-center'>
                    {exercises.map((exercise) => (
                            <div key={exercise.id} className = "mb-8 p-4 border rounded bg-gray-50 w-1/2 xs:w-5/6">
                                <h2 className="text-xl font-semibold mb-4">{exercise.exercise_name}</h2>
                                {renderSets(exercise)}
                                <button className="submit mt-4 p-1" onClick={() => addSet(exercise)}>Add Set</button>
                            </div>
                        ))}
                </div>
                <button className='submit mt-2' onClick={finishWorkout}>Finish Workout</button>
            </div>
        </div>
    )
}



