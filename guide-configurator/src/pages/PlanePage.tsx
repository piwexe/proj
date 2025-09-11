import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { loadParam, saveParam } from '../utils/storage';

import flat from '../images/flat.png';
import vertical1 from '../images/vertical1.png';
import horizontal from '../images/horizontal.png';
import wall from '../images/wall.png';
import vertical2 from '../images/vertical2.png';
import wall2 from '../images/wall2.png';

const options = [
  { id: 'flat', label: 'Плашмя', image: flat },
  { id: 'vertical1', label: 'Вертикально', image: vertical1 },
  { id: 'horizontal', label: 'Горизонтально', image: horizontal },
  { id: 'wall', label: 'Настенно', image: wall },
  { id: 'vertical2', label: 'Вертикально 2', image: vertical2 },
  { id: 'wall2', label: 'Настенно 2', image: wall2 },
];

export default function PlanePage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadParam<string>('plane', '');
    if (saved) setSelectedId(saved);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleApply = () => {
    if (selectedId) {
      saveParam('plane', selectedId);
      navigate('/position');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <Header />

      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 px-8 py-10 place-items-center">
        {options.map(({ id, label, image }) => (
          <div
            key={id}
            onClick={() => handleSelect(id)}
            className={`cursor-pointer border-2 rounded-md p-3 transition-all text-center ${
              selectedId === id ? 'border-orange-500 shadow-md' : 'border-orange-200'
            }`}
          >
            <img src={image} alt={label} className="w-40 h-auto mx-auto" />
            <p className="mt-3 text-orange-500 font-semibold">{label}</p>
          </div>
        ))}
      </main>

      <div className="flex justify-center pb-6">
        <button
          onClick={handleApply}
          disabled={!selectedId}
          className={`px-8 py-2 rounded-full font-medium ${
            selectedId
              ? 'bg-orange-300 text-white hover:bg-orange-400'
              : 'bg-orange-100 text-orange-300 cursor-not-allowed'
          }`}
        >
          Применить
        </button>
      </div>

      <footer className="flex justify-between items-end px-6 py-4 text-sm">
        <button
          onClick={() => navigate('/scheme')}
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
