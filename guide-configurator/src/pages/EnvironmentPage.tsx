import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { loadParam, saveParam } from '../utils/storage';

export default function EnvironmentPage() {
  const [aggressiveEnv, setAggressiveEnv] = useState<boolean>(false);
  const [maxTemperature, setMaxTemperature] = useState<string>('25');
  const [warning, setWarning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadedEnv = loadParam<boolean>('aggressiveEnv', false);
    const loadedTemp = loadParam<number>('maxTemperature', 25);
    if (loadedEnv !== null) setAggressiveEnv(loadedEnv);
    setMaxTemperature(loadedTemp.toString());
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWarning(false);
    setMaxTemperature(e.target.value);
  };

  const handleApply = () => {
    const tempValue = Number(maxTemperature);
    if (aggressiveEnv === null || isNaN(tempValue)) {
      setWarning(true);
      return;
    }

    saveParam('aggressiveEnv', aggressiveEnv); // сохраняем как boolean
    saveParam('maxTemperature', tempValue);    // сохраняем как number
    navigate('/result');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-orange-500 font-semibold text-lg mb-6 max-w-xl">
          Есть ли агрессивные факторы воздействия на направляющие? (например: вода, щелочи, кислоты и т.д.)
        </div>

        <div className="flex gap-4 mb-10">
          <button
            onClick={() => setAggressiveEnv(true)}
            className={`px-6 py-2 rounded-full font-bold text-white transition ${
              aggressiveEnv === true ? 'bg-orange-400' : 'bg-orange-200 hover:bg-orange-300'
            }`}
          >
            Да
          </button>

          <button
            onClick={() => setAggressiveEnv(false)}
            className={`px-6 py-2 rounded-full font-bold text-white transition ${
              aggressiveEnv === false ? 'bg-orange-400' : 'bg-orange-200 hover:bg-orange-300'
            }`}
          >
            Нет
          </button>
        </div>

        <div className="text-orange-500 font-semibold text-lg mb-2">
          Температура использования в °C
        </div>

        <input
          type="text"
          value={maxTemperature}
          onChange={handleInput}
          className="w-60 bg-orange-200 text-white text-center font-semibold rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4"
        />

        {warning && (
          <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-md mb-4">
            Пожалуйста, выберите вариант и введите корректное числовое значение температуры.
          </div>
        )}

        <button
          onClick={handleApply}
          className="bg-orange-300 text-white px-6 py-2 rounded-full hover:bg-orange-400 transition"
        >
          Применить
        </button>
      </main>

      <footer className="flex justify-between items-end px-6 py-4 text-sm">
        <button
          onClick={() => navigate('/load')}
          className="bg-orange-100 hover:bg-orange-200 rounded-full w-8 h-8 text-xl text-orange-400 font-bold flex items-center justify-center"
        >
          &lt;
        </button>
        <button
          onClick={handleApply}
          className="bg-orange-100 hover:bg-orange-200 rounded-full w-8 h-8 text-xl text-orange-400 font-bold flex items-center justify-center"
        >
          &gt;
        </button>
      </footer>
    </div>
  );
}
