import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { loadAllParams } from '../utils/storage';

type Row = [string, string];

type BackendResponse = {
  ok?: boolean;
  variant?: string;
  load?: number;
  rows?: Row[];
  notes?: string[];
  // поля ошибок от NestJS/валидации
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

function pickServerErrorText(data: BackendResponse | null, fallback: string): string {
  if (!data) return fallback;
  if (Array.isArray(data.message) && data.message.length) return data.message.join('\n');
  if (typeof data.message === 'string' && data.message.trim()) return data.message;
  if (typeof data.error === 'string' && data.error.trim()) return data.error;
  return fallback;
}

export default function ResultPage() {
  const navigate = useNavigate();

  const [results, setResults] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // держим про запас (не рендерим пока)
  const [variant, setVariant] = useState<string | undefined>();
  const [loadValue, setLoadValue] = useState<number | undefined>();
  const [notes, setNotes] = useState<string[] | undefined>();

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setVariant(undefined);
    setLoadValue(undefined);
    setNotes(undefined);

    try {
      const payload = loadAllParams();

      const resp = await fetch('http://localhost:3000/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: BackendResponse | null = null;
      try {
        data = (await resp.json()) as BackendResponse;
      } catch {
        // тело может отсутствовать при некоторых 4xx/5xx
      }

      if (!resp.ok) {
        const msg = pickServerErrorText(data, `Ошибка сервера: ${resp.status}`);
        setError(msg);
        return;
      }

      if (data && data.ok === false) {
        const msg = pickServerErrorText(data, 'Бэкенд вернул ошибку.');
        setError(msg);
        return;
      }

      if (!data || !Array.isArray(data.rows)) {
        setError('В ответе нет данных для таблицы.');
        return;
      }

      setResults(data.rows);
      setVariant(data.variant);
      setLoadValue(data.load);
      setNotes(data.notes);
    } catch {
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
          className="mb-6 bg-orange-300 text-white font-bold px-8 py-2 rounded-full hover:bg-orange-400 disabled:opacity-60"
        >
          {loading ? 'Рассчитываем...' : 'Рассчитать'}
        </button>

        {error && (
          <div className="text-red-600 bg-red-100 px-4 py-2 rounded mb-4 whitespace-pre-line text-center max-w-2xl">
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
