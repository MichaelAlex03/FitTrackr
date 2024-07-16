import { useState, useEffect } from 'react';
import axios from 'axios';

interface Exercise {
    id: number;
    exercise_name: string;
}

export default function Dropdown(){
    const [isOpen, setIsOpen] = useState(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

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

    function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
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

    return (
        <div className="w-full">
            <select
                className="submit rounded bg-gray-300"
                onClick={toggleDropdown}
                onChange={handleChange}
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
            <div className="max-h-40 overflow-y-auto mt-2">
                <ul>
                    {selectedExercises.map((exercise, index) => (
                        <li key={index} className="flex justify-between items-center">
                            {exercise}
                            <button onClick={() => handleRemoveExercise(exercise)} className="submit w-2/12 ml-auto"><img src="../images/trash.webp" alt="trash" /></button>
                        </li>
                    ))}
                </ul>
            </div>
            <button className="submit bg-gray-300" onClick={handleAddExercise}>Add</button>
        </div>
    );
}