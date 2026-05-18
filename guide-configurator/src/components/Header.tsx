import { useLocation } from 'react-router-dom';

const routeMap: Record<string, string> = {
  '/': 'Старт',
  '/scheme': 'Схема',
  '/plane': 'Плоскость',
  '/position': 'Расположение',
  '/load': 'Нагрузка',
  '/environment': 'Среда',
  '/result': 'Подбор',
};

export default function Header() {
  const location = useLocation();
  const current = routeMap[location.pathname];

  const pages = Object.values(routeMap);

  return (
    <header className="flex justify-center gap-6 py-6 bg-white">
      {pages.map((title) => (
        <span
          key={title}
          className={`px-8 py-3 rounded-full text-lg font-medium border border-yellow-300 ${
            title === current ? 'bg-yellow-300 text-white' : 'bg-orange-100 text-orange-400'
          }`}
        >
          {title}
        </span>
      ))}
    </header>
  );
}
