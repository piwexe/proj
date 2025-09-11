import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { loadParam, saveParam } from '../utils/storage';
import load_l1_l2_l3 from '../images/load_l1_l2_l3.png';

export default function LoadPage() {
  const navigate = useNavigate();

  const [l1, setL1] = useState('0.2');
  const [l2, setL2] = useState('1');
  const [l3, setL3] = useState('1');
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    setL1(loadParam('l1', 0.2).toString());
    setL2(loadParam('l2', 1).toString());
    setL3(loadParam('l3', 1).toString());
  }, []);

  const handleApply = () => {
    const numL1 = Number(l1);
    const numL2 = Number(l2);
    const numL3 = Number(l3);

    if ([numL1, numL2, numL3].some((v) => isNaN(v))) {
      setWarning(true);
      return;
    }

    saveParam('l1', numL1);
    saveParam('l2', numL2);
    saveParam('l3', numL3);
    navigate('/environment');
  };

  const handleInput = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setWarning(false);
    setter(e.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <Header />

      <main className="flex-1 flex flex-col md:flex-row items-center justify-around px-10 py-8">
        <div className="flex flex-col gap-6 w-full max-w-sm">
          <div>
            <label className="block text-orange-500 font-semibold mb-1">Смещение по L1 в метрах</label>
            <input
              type="text"
              value={l1}
              onChange={handleInput(setL1)}
              className="w-full bg-orange-200 text-white text-center font-semibold rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-orange-500 font-semibold mb-1">Смещение по L2 в метрах</label>
            <input
              type="text"
              value={l2}
              onChange={handleInput(setL2)}
              className="w-full bg-orange-200 text-white text-center font-semibold rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div>
            <label className="block text-orange-500 font-semibold mb-1">Смещение по L3 в метрах</label>
            <input
              type="text"
              value={l3}
              onChange={handleInput(setL3)}
              className="w-full bg-orange-200 text-white text-center font-semibold rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <p className="text-orange-500 text-sm">
            Если смещения по осям нет, то в полях следует указать - 0. <br />
            Если смещение направлено в другую сторону относительно схемы, то следует указать значение с минусом.
          </p>

          {warning && (
            <div className="bg-red-100 text-red-600 text-sm px-4 py-2 rounded-md">
              Пожалуйста, введите корректные числовые значения.
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
          src={load_l1_l2_l3}
          alt="L1 L2 L3 spacing"
          className="max-w-[400px] w-full h-auto mt-10 md:mt-0"
        />
      </main>

      <footer className="flex justify-between items-end px-6 py-4 text-sm">
        <button
          onClick={() => navigate('/position')}
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
