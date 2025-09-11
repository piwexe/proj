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
    <header className="flex justify-center gap-4 py-4 bg-white">
      {pages.map((title) => (
        <span
          key={title}
          className={`px-4 py-1 rounded-full text-sm font-medium border border-yellow-300 ${
            title === current ? 'bg-yellow-300 text-white' : 'bg-orange-100 text-orange-400'
          }`}
        >
          {title}
        </span>
      ))}
    </header>
  );
}
