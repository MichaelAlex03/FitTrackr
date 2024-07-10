import { useNavigate } from 'react-router-dom';

export default function Welcome() {

const navigate = useNavigate();

const navigateToLogin = () => {
    navigate('/login');
};

const navigateToCreateAccount = () => {
    navigate('/create-account');
};

return (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-4/5 bg-white p-8 rounded shadow-lg">
            <h1 className="text-3xl font-bold mb-10 text-center">Welcome To FitTrackr</h1>
            <button className="submit mb-5" onClick={navigateToCreateAccount}>
                Get started
            </button>
            <p className="text-center mb-2">Already have an account?</p>
            <button className="submit bg-gray-300" onClick={navigateToLogin}>
                Sign in
            </button>
        </div>
    </div>
)
}

