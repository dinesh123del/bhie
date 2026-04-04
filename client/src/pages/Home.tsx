import { apiRoute } from '../config/api';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Welcome to BHIE
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Business Health Implementation Ecosystem - Base project ready!
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Backend Status</h2>
          <p>Server: {apiRoute('/health')}</p>
          <p>MongoDB: Connected</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
          <ul className="space-y-2">
            <li>npm run dev (server & client)</li>
            <li>Add authentication</li>
            <li>Build dashboard</li>
            <li>CRUD operations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
