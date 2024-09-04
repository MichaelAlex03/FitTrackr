import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Welcome from './pages/welcome';
import CreateAccount from './pages/create--account';
import WorkoutPage from './pages/workout--page';
import CreateWorkout from './pages/create--workout';
import WorkoutView from './pages/workout--view';
import ExerciseHistory from './pages/exercise-history';



function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<div><Login /></div>} />
        <Route path="/create-account" element={<div><CreateAccount /></div>} />
        <Route path="/workout" element={<div><WorkoutPage /></div>} />
        <Route path="/create-workout" element={<div><CreateWorkout /></div>} />
        <Route path="/workout--view/:id" element={<div><WorkoutView /></div>} />
        <Route path="/workout-history/:id/:exerciseName" element={<div><ExerciseHistory /></div>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App
