import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { loadParam, saveParam } from '../utils/storage';
import rail_example from '../images/rail_example.png';

export default function SchemePage() {
  const navigate = useNavigate();

  const [carriageCount, setCarriageCount] = useState<number>(1);
  const [guideCount, setGuideCount] = useState<number>(1);

  // Загружаем из localStorage при первом рендере
  useEffect(() => {
    setCarriageCount(loadParam('carriageCount', 1));
    setGuideCount(loadParam('guideCount', 1));
  }, []);

  const handleApply = () => {
    saveParam('carriageCount', carriageCount);
    saveParam('guideCount', guideCount);
    navigate('/plane');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <Header />

      <main className="flex-1 flex flex-col md:flex-row items-center justify-around px-10 py-8">
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <div>
            <label className="block text-orange-500 font-semibold mb-1">
              Количество кареток в одной направляющей
            </label>
            <select
              value={carriageCount}
              onChange={(e) => setCarriageCount(parseInt(e.target.value))}
              className="w-full border border-orange-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>

          <div>
            <label className="block text-orange-500 font-semibold mb-1">
              Количество направляющих
            </label>
            <select
              value={guideCount}
              onChange={(e) => setGuideCount(parseInt(e.target.value))}
              className="w-full border border-orange-200 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
            </select>
          </div>

          <button
            onClick={handleApply}
            className="bg-orange-300 text-white px-6 py-2 rounded-full hover:bg-orange-400 transition mt-4"
          >
            Применить
          </button>
        </div>

        <img
          src={rail_example}
          alt="Rail scheme"
          className="max-w-[400px] w-full h-auto mt-10 md:mt-0"
        />
      </main>

      <footer className="flex justify-between items-end px-6 py-4 text-sm">
        <button
          onClick={() => navigate('/')}
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
