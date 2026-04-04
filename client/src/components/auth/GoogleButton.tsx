import { FcGoogle } from 'react-icons/fc';
import { apiRoute } from '../../config/api';

export const GoogleButton = () => {
  const googleAuthUrl = apiRoute('/auth/google');

  return (
    <a 
      href={googleAuthUrl}
      className="w-full flex items-center justify-center gap-3 px-6 py-6 bg-white/10 backdrop-blur-xl border border-white/20 hover:border-indigo-400/50 hover:bg-white/20 transition-all duration-300 rounded-2xl group"
    >
      <FcGoogle className="w-6 h-6 group-hover:scale-110 transition-transform" />
      <span className="font-medium text-lg text-gray-100 group-hover:text-indigo-100">
        Continue with Google
      </span>
    </a>
  );
};
