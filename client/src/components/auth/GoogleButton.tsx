import { FcGoogle } from 'react-icons/fc';
import { apiRoute } from '../../config/api';

export const GoogleButton = () => {
  const googleAuthUrl = apiRoute('/auth/google');

  return (
    <a 
      href={googleAuthUrl}
      className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all duration-300 rounded-xl group shadow-lg hover:shadow-indigo-500/10"
    >
      <FcGoogle className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="font-semibold text-white group-hover:text-white transition-colors">
        Continue with Google
      </span>
    </a>
  );
};
