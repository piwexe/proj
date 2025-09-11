import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { loadAllParams } from '../utils/storage';

export default function ResultPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState<[string, string][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = loadAllParams();
      const response = await fetch('http://localhost:5000/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Ошибка при запросе');

      const data: [string, string][] = await response.json();
      setResults(data);
    } catch (err) {
      setError('Не удалось выполнить расчёт. Проверьте соединение с сервером.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <Header />

      <main className="flex flex-col items-center px-6 py-8">
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="mb-6 bg-orange-300 text-white font-bold px-8 py-2 rounded-full hover:bg-orange-400"
        >
          {loading ? 'Рассчитываем...' : 'Рассчитать'}
        </button>

        {error && (
          <div className="text-red-600 bg-red-100 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <table className="w-full max-w-md border-separate border-spacing-y-1">
            <thead>
              <tr className="bg-orange-200 text-white font-bold text-center">
                <th className="py-2">КОД</th>
                <th className="py-2">Коэф. запаса</th>
              </tr>
            </thead>
            <tbody>
              {results.map(([code, value], index) => (
                <tr
                  key={code}
                  className={`text-center ${index % 2 === 0 ? 'bg-white' : 'bg-orange-100'}`}
                >
                  <td className="py-2 font-semibold">{code}</td>
                  <td className="py-2 font-bold">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-10 bg-orange-300 text-white font-bold px-8 py-2 rounded-full hover:bg-orange-400"
        >
          Начало
        </button>
      </main>

      <footer className="flex justify-start px-6 py-4">
        <button
          onClick={() => navigate('/environment')}
          className="bg-orange-100 hover:bg-orange-200 rounded-full w-8 h-8 text-xl text-orange-400 font-bold flex items-center justify-center"
        >
          &lt;
        </button>
      </footer>
    </div>
  );
}
