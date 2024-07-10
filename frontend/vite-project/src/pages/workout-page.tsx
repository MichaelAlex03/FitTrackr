import { useNavigate } from 'react-router-dom';

export default function WorkoutPage() {

    const navigate = useNavigate();

    const navigateToCreateWorkout = () => {
        navigate('/create-workout');
    };



    return (
        <div className="background">
            <div className="relative content">
                <h1 className="absolute top-5 left-5 text-2xl font-bold">My Workouts</h1>
                <button className=" absolute submit top-24 w-5/6" onClick={navigateToCreateWorkout}>Create a new workout</button>
                <div className="flex justify-center sm:flex-col mt-8">
                    <div className=" submit m-8">Workout 1</div>
                    <div className=" submit m-8">Workout 2</div>
                    <div className=" submit m-8">Workout 3</div>
                    <div className=" submit m-8">Workout 4</div>
                </div>
            </div>
        </div>
    )
}