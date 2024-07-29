import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Exercise {
    id: number;
    exercise_name: string;
    exercise_sets: number;
    exercise_reps: number;
    exercise_weight: number;
}

export default function WorkoutView() {
    const { id } = useParams<{ id: string }>();
    const [exercises, setExercises] = useState<Exercise[]>([]);

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
                console.log(response.data)
                setExercises(response.data)
            } catch (error) {
                console.error('Error fetching exercises:', error);
            }
        };

        fetchExercises();
    }, []);

    console.log(exercises)

    return (
        <div className = "background">
            <div className = "content">
                {exercises.map((exercise) => (
                    <div key={exercise.id}>
                        <h2>{exercise.exercise_name}</h2>
                        <p>sets {exercise.exercise_sets}</p>
                        <p>reps {exercise.exercise_reps}</p>
                        <p>weight {exercise.exercise_weight}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}