import {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Exercise {
  exercise_name: string;
  id: number;
  exercise_reps: number;
  exercise_weight: number;
}

function ExerciseHistory() {

  const{ id, exerciseName } = useParams();

  const [exerciseHistory, setExerciseHistory] = useState<Exercise[]>([]);


  useEffect(() => {

      const fetchExerciseHistory = async () => {

        try {
          const result = await axios.get(`http://localhost:3000/exercise_history/${id}/${exerciseName}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
          })
          console.log(result.data.result);
          setExerciseHistory(result.data.result);

        } catch (error) {
          console.log("failed to retrieve sets");
        }
    
      };
      fetchExerciseHistory();
  },[]);

  return (
    <div className='background'>
        <div className='content'>
            {exerciseHistory.map((exercise) => (
              <div key={exercise.id} className='flex '>
                <p>{exercise.exercise_reps}</p>
                <p>{exercise.exercise_weight}</p>
              </div>
            ))}
        </div>
    </div>
  )
}

export default ExerciseHistory