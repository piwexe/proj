import Header from '../components/Header';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import compactImage from '../images/compact.png';
import { saveParam, loadParam } from '../utils/storage';

export default function StartPage() {
  const [selected, setSelected] = useState<boolean>(false);
  const navigate = useNavigate();

  // При первом монтировании — загружаем состояние из localStorage
  useEffect(() => {
    const savedValue = loadParam('isCompact', false);
    setSelected(savedValue);
  }, []);

  const handleSelect = () => {
    const newValue = !selected;
    setSelected(newValue);
    saveParam('isCompact', newValue); // Сохраняем как boolean
  };

  const handleApply = () => {
    if (selected) navigate('/scheme');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <Header />

      <main className="flex flex-col items-center justify-center flex-1">
        <div
          className={`border-2 rounded-md p-6 cursor-pointer transition ${
            selected ? 'border-yellow-500 shadow-lg' : 'border-gray-200'
          }`}
          onClick={handleSelect}
        >
          <img
            src={compactImage}
            alt="Compact Guide"
            className="w-48 h-auto mx-auto"
          />
          <h2 className="text-center text-xl font-bold text-yellow-600 mt-4">
            COMPACT
          </h2>
          <p className="text-center text-gray-600 text-sm mt-1">
            Роликовые направляющие
          </p>
        </div>

        <button
          onClick={handleApply}
          className={`mt-10 px-6 py-2 text-white rounded-full ${
            selected
              ? 'bg-yellow-500 hover:bg-yellow-600'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          Применить
        </button>
      </main>

      <footer className="flex justify-between items-end px-6 py-4 text-sm">
        <p className="text-gray-700">
          Системы линейного перемещения{' '}
          <span className="text-red-600 font-semibold">российского производства</span>
        </p>
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
