import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { loadParam, saveParam } from '../utils/storage';
import position_l4_l5 from '../images/position_l4_l5.png';

export default function PositionPage() {
  const navigate = useNavigate();

  const [l4, setL4] = useState('0.2');
  const [l5, setL5] = useState('1');
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    setL4(loadParam('l4', 0.2).toString());
    setL5(loadParam('l5', 1).toString());
  }, []);

  const handleInput = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setWarning(false);
    setter(e.target.value);
  };

  const handleApply = () => {
    const numL4 = Number(l4);
    const numL5 = Number(l5);

    if ([numL4, numL5].some((v) => isNaN(v) || v <= 0)) {
      setWarning(true);
      return;
    }

    saveParam('l4', numL4);
    saveParam('l5', numL5);
    navigate('/load');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <Header />

      <main className="flex-1 flex flex-col md:flex-row items-center justify-around px-10 py-8">
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <div>
            <label className="block text-orange-500 font-semibold mb-1">
              Расстояние между каретками L4 в метрах
            </label>
            <input
              type="text"
              value={l4}
              onChange={handleInput(setL4)}
              className="w-full bg-orange-200 text-white text-center font-semibold rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-orange-500 font-semibold mb-1">
              Расстояние между направляющими L5 в метрах
            </label>
            <input
              type="text"
              value={l5}
              onChange={handleInput(setL5)}
              className="w-full bg-orange-200 text-white text-center font-semibold rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {warning && (
            <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-md">
              Пожалуйста, введите положительные числовые значения.
            </div>
          )}

          <button
            onClick={handleApply}
            className="bg-orange-300 text-white px-6 py-2 rounded-full hover:bg-orange-400 transition mt-4"
          >
            Применить
          </button>
        </div>

        <img
          src={position_l4_l5}
          alt="L4 and L5 spacing"
          className="max-w-[400px] w-full h-auto mt-10 md:mt-0"
        />
      </main>

      <footer className="flex justify-between items-end px-6 py-4 text-sm">
        <button
          onClick={() => navigate('/plane')}
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
