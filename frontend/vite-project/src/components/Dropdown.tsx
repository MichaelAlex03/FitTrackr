import { useState } from 'react';
const exercises = ['Push-up', 'Squat', 'Lunge', 'Plank', 'Burpee'];

export default function Dropdown(){
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="w-full">
            <button
                className="submit rounded bg-gray-300"
                onClick={toggleDropdown}
            >
                Add Exercises
            </button>
            {isOpen && (
                <ul className="absolute right-0 mt-2 w-56 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {exercises.map((exercise, index) => (
                        <li
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {exercise}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}