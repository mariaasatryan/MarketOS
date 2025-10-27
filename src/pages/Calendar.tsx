import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Check, Edit2, Trash2 } from 'lucide-react';
import { mpColors, type Marketplace } from '../lib/mockData';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type EventType = 'supply' | 'shipment' | 'reminder' | 'meeting' | 'deadline' | 'payment' | 'inventory' | 'marketing' | 'custom';

interface CalendarEvent {
  id: string;
  type: EventType;
  marketplace?: Marketplace;
  title: string;
  date: string;
  time?: string;
  description?: string;
  isImportant: boolean;
  isCompleted: boolean;
  linkedEventId?: string;
}


const eventTypeColors = {
  supply: 'bg-red-100 text-red-700 border-red-300',
  shipment: 'bg-green-100 text-green-700 border-green-300',
  reminder: 'bg-red-100 text-red-700 border-red-300',
  meeting: 'bg-purple-100 text-purple-700 border-purple-300',
  deadline: 'bg-orange-100 text-orange-700 border-orange-300',
  payment: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  inventory: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  marketing: 'bg-pink-100 text-pink-700 border-pink-300',
  custom: 'bg-slate-100 text-slate-700 border-slate-300',
};

const eventTypeLabels = {
  supply: 'Поставка',
  shipment: 'Отгрузка',
  reminder: 'Напоминание',
  meeting: 'Встреча',
  deadline: 'Дедлайн',
  payment: 'Платеж',
  inventory: 'Инвентаризация',
  marketing: 'Маркетинг',
  custom: 'Пользовательское',
};

export function Calendar() {
  const { user } = useAuth();
  const [view, setView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [, setLoading] = useState(true);
  const [customEventTypes, setCustomEventTypes] = useState<{name: string, color: string}[]>([]);
  const [showCustomTypeModal, setShowCustomTypeModal] = useState(false);
  const [newCustomType, setNewCustomType] = useState({name: '', color: 'bg-slate-100 text-slate-700 border-slate-300'});

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  // Обновляем календарь каждый день в полночь
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      setCurrentDate(new Date());
    }, timeUntilMidnight);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: true });

      if (error) throw error;

      const formattedEvents: CalendarEvent[] = (data || []).map(e => ({
        id: e.id,
        type: e.type,
        marketplace: e.marketplace,
        title: e.title,
        date: e.date,
        time: e.time || undefined,
        description: e.description || undefined,
        isImportant: e.is_important,
        isCompleted: e.is_completed,
        linkedEventId: e.linked_event_id || undefined,
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert([{
          user_id: user!.id,
          type: event.type,
          marketplace: event.marketplace || null,
          title: event.title,
          date: event.date,
          time: event.time || null,
          description: event.description || null,
          is_important: event.isImportant,
          is_completed: event.isCompleted,
          linked_event_id: event.linkedEventId || null,
        }])
        .select()
        .single();

      if (error) throw error;
      await loadEvents();
      setShowEventModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Ошибка при создании события');
    }
  };

  const handleUpdateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          type: updates.type,
          marketplace: updates.marketplace || null,
          title: updates.title,
          date: updates.date,
          time: updates.time || null,
          description: updates.description || null,
          is_important: updates.isImportant,
          is_completed: updates.isCompleted,
        })
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      await loadEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Ошибка при обновлении события');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Удалить событие?')) return;

    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) throw error;
      await loadEvents();
      setShowSidebar(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Ошибка при удалении события');
    }
  };

  const handleToggleComplete = async (event: CalendarEvent) => {
    await handleUpdateEvent(event.id, { ...event, isCompleted: !event.isCompleted });
    setShowSidebar(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = useCallback((day: number | Date) => {
    const dateStr = typeof day === 'number'
      ? `2025-10-${String(day).padStart(2, '0')}`
      : `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;

    return events.filter(event => event.date === dateStr);
  }, [events]);

  const monthName = useMemo(() => 
    currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }), 
    [currentDate]
  );
  
  const days = useMemo(() => 
    view === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate), 
    [view, currentDate]
  );

  const handlePrevious = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Календарь</h1>
          <p className="text-slate-600 mt-1">Управление событиями и дедлайнами</p>
        </div>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setShowEventModal(true);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Добавить событие
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold text-slate-800 min-w-[200px] text-center">
                {view === 'month' ? monthName : `Неделя ${currentDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`}
              </h2>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Сегодня
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'month'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Месяц
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'week'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Неделя
            </button>
          </div>
        </div>

        {view === 'month' ? (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                const events = day ? getEventsForDate(day) : [];
                const isToday = day ? new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() : false;

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 rounded-lg border ${
                      day
                        ? isToday
                          ? 'bg-red-50 border-red-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                        : 'bg-slate-50 border-slate-100'
                    } transition-colors`}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-red-600' : 'text-slate-700'}`}>
                          {typeof day === 'number' ? day : day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {events.slice(0, 2).map((event) => (
                            <button
                              key={event.id}
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowSidebar(true);
                              }}
                              className={`w-full text-left px-2 py-1 rounded text-xs font-medium border ${eventTypeColors[event.type]} hover:opacity-80 transition-opacity truncate relative`}
                            >
                              {event.title}
                              {event.isCompleted && (
                                <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 rounded-bl">✓</span>
                              )}
                            </button>
                          ))}
                          {events.length > 2 && (
                            <div className="text-xs text-slate-500 pl-2">+{events.length - 2} еще</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (!(day instanceof Date)) return null;
                const events = getEventsForDate(day);
                const isToday = day.getDate() === new Date().getDate();

                return (
                  <div key={index} className={`p-3 rounded-lg border ${isToday ? 'bg-red-50 border-red-300' : 'bg-white border-slate-200'}`}>
                    <div className={`text-center mb-3 ${isToday ? 'text-red-600' : 'text-slate-700'}`}>
                      <div className="text-xs font-medium">
                        {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                      </div>
                      <div className="text-2xl font-bold">{day.getDate()}</div>
                    </div>
                    <div className="space-y-2">
                      {events.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowSidebar(true);
                          }}
                          className={`w-full text-left px-2 py-2 rounded text-xs font-medium border ${eventTypeColors[event.type]} hover:opacity-80 transition-opacity relative`}
                        >
                          <div className="font-semibold mb-1">{event.time || 'Весь день'}</div>
                          <div className="truncate">{event.title}</div>
                          {event.isCompleted && (
                            <span className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 rounded">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              {selectedEvent ? 'Редактировать событие' : 'Добавить событие'}
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название</label>
                <input
                  type="text"
                  defaultValue={selectedEvent?.title}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Название события"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Дата</label>
                  <input
                    type="date"
                    defaultValue={selectedEvent?.date}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Время</label>
                  <input
                    type="time"
                    defaultValue={selectedEvent?.time}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Тип</label>
                <div className="flex gap-2">
                  <select
                    defaultValue={selectedEvent?.type}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="supply">Поставка</option>
                    <option value="shipment">Отгрузка</option>
                    <option value="reminder">Напоминание</option>
                    <option value="meeting">Встреча</option>
                    <option value="deadline">Дедлайн</option>
                    <option value="payment">Платеж</option>
                    <option value="inventory">Инвентаризация</option>
                    <option value="marketing">Маркетинг</option>
                    <option value="custom">Пользовательское</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCustomTypeModal(true)}
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    title="Добавить свой тип"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Маркетплейс</label>
                <select
                  defaultValue={selectedEvent?.marketplace}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Без привязки</option>
                  <option value="WB">Wildberries</option>
                  <option value="Ozon">Ozon</option>
                  <option value="YaMarket">Яндекс Маркет</option>
                  <option value="SMM">СберМегаМаркет</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
                <textarea
                  defaultValue={selectedEvent?.description}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Дополнительная информация"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={selectedEvent?.isImportant}
                  className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-2 focus:ring-red-500"
                />
                <span className="text-sm text-slate-700">Важное событие</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Отмена
              </button>
              <button
                onClick={(e) => {
                  const form = e.currentTarget.closest('div')!.parentElement!;
                  const title = (form.querySelector('input[type="text"]') as HTMLInputElement).value;
                  const date = (form.querySelectorAll('input[type="date"]')[0] as HTMLInputElement).value;
                  const time = (form.querySelector('input[type="time"]') as HTMLInputElement).value;
                  const type = (form.querySelector('select') as HTMLSelectElement).value as EventType;
                  const marketplace = (form.querySelectorAll('select')[1] as HTMLSelectElement).value as Marketplace | undefined;
                  const description = (form.querySelector('textarea') as HTMLTextAreaElement).value;
                  const isImportant = (form.querySelector('input[type="checkbox"]') as HTMLInputElement).checked;

                  if (selectedEvent) {
                    handleUpdateEvent(selectedEvent.id, {
                      title, date, time, type, marketplace, description, isImportant, isCompleted: selectedEvent.isCompleted
                    });
                  } else {
                    handleCreateEvent({
                      title, date, time, type, marketplace, description, isImportant, isCompleted: false
                    });
                  }
                  setShowEventModal(false);
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                {selectedEvent ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSidebar && selectedEvent && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Детали события</h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${eventTypeColors[selectedEvent.type]}`}>
                  {eventTypeLabels[selectedEvent.type]}
                </span>
                {selectedEvent.marketplace && (
                  <span className={`inline-block ml-2 px-3 py-1 rounded-full text-xs font-medium border ${mpColors[selectedEvent.marketplace]}`}>
                    {selectedEvent.marketplace}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800">{selectedEvent.title}</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Дата:</span>
                  <span>{new Date(selectedEvent.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                {selectedEvent.time && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-medium">Время:</span>
                    <span>{selectedEvent.time}</span>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-1">Описание:</p>
                  <p className="text-sm text-slate-600">{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.isImportant && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-700">Важное событие</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 space-y-2">
                {!selectedEvent.isCompleted && (
                  <button
                    onClick={() => handleToggleComplete(selectedEvent)}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Check size={16} />
                    Отметить выполненным
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowSidebar(false);
                    setShowEventModal(true);
                  }}
                    className="w-full tech-button px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium"
                >
                  <Edit2 size={16} />
                  Изменить
                </button>
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="w-full tech-button px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium"
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {showCustomTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Добавить тип события</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Название типа</label>
                <input
                  type="text"
                  value={newCustomType.name}
                  onChange={(e) => setNewCustomType({...newCustomType, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Например: Конференция"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Цвет</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {name: 'Синий', value: 'bg-red-100 text-red-700 border-red-300'},
                    {name: 'Зеленый', value: 'bg-green-100 text-green-700 border-green-300'},
                    {name: 'Красный', value: 'bg-red-100 text-red-700 border-red-300'},
                    {name: 'Фиолетовый', value: 'bg-purple-100 text-purple-700 border-purple-300'},
                    {name: 'Оранжевый', value: 'bg-orange-100 text-orange-700 border-orange-300'},
                    {name: 'Желтый', value: 'bg-yellow-100 text-yellow-700 border-yellow-300'},
                    {name: 'Индиго', value: 'bg-indigo-100 text-indigo-700 border-indigo-300'},
                    {name: 'Розовый', value: 'bg-pink-100 text-pink-700 border-pink-300'},
                  ].map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewCustomType({...newCustomType, color: color.value})}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border ${color.value} ${
                        newCustomType.color === color.value ? 'ring-2 ring-red-500' : ''
                      }`}
                    >
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCustomTypeModal(false);
                  setNewCustomType({name: '', color: 'bg-slate-100 text-slate-700 border-slate-300'});
                }}
                className="flex-1 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  if (newCustomType.name.trim()) {
                    setCustomEventTypes([...customEventTypes, newCustomType]);
                    setShowCustomTypeModal(false);
                    setNewCustomType({name: '', color: 'bg-slate-100 text-slate-700 border-slate-300'});
                  }
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
