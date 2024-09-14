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
        <div className='absolute top-10'>
            <h1  className='text-3xl font-bold mb-2 text'>Previous Sets for {exerciseName}</h1>
            <div className='bg-white rounded-lg'>
              <ul className='divide-y divide-gray-200'>
              {exerciseHistory.map((exercise) => (
                <div key={exercise.id} className='flex justify-between rounded-md p-5'>
                  <p className=''>Reps: {exercise.exercise_reps}</p>
                  <p>Weight: {exercise.exercise_weight}</p>
                </div>
              ))}
              </ul>
            </div>
            
        </div>
    </div>
  )
}

export default ExerciseHistory