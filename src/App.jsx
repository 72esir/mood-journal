import React, { useEffect, useState } from 'react';
import './App.css';

const Mood = Object.freeze({
  VERY_GOOD: 5,
  GOOD: 4,
  NEUTRAL: 3,
  BAD: 2,
  VERY_BAD: 1,
});


const moodOptions = [
  { id: Mood.VERY_GOOD, label: 'Очень хорошо', face: '😄' },
  { id: Mood.GOOD, label: 'Хорошо', face: '🙂' },
  { id: Mood.NEUTRAL, label: 'Нормально', face: '😐' },
  { id: Mood.BAD, label: 'Не очень', face: '🙁' },
  { id: Mood.VERY_BAD, label: 'Плохо', face: '😞' },
];

const STORAGE_KEY = 'moodEntries';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

function MoodJournal() {
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');

  const [entries, setEntries] = useState(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const firstWeekDay = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarCells = [
    ...Array(firstWeekDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const moodByDate = entries.reduce((map, entry) => {
    map[entry.date] = entry;
    return map;
  }, {});

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.savedAt) - new Date(a.savedAt)
  );

  const handleSave = () => {
    if (!selectedMood) return;
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const newEntry = {
      mood: selectedMood,
      note: note.trim(),
      date: dateKey,
      savedAt: now.toISOString(),
    };
    const withoutToday = entries.filter((entry) => entry.date !== dateKey);
    setEntries([newEntry, ...withoutToday]);
    setNote('');
  };

  const monthLabel = today.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="app">
      <header className="hero">
        <div>
          <h1>Как ты сегодня?</h1>
          <p className="hint">
            Выбери одного человечка, оставь заметку и сохрани настроение.
          </p>
        </div>
        <div className="today">Сегодня · {formatDate(today)}</div>
      </header>

      <section className="card">
        <h2>Настроение</h2>
        <div className="mood-list">
          {moodOptions.map((mood) => (
            <button
              key={mood.id}
              type="button"
              className={`mood-btn ${selectedMood === mood.id ? 'active' : ''}`}
              onClick={() => setSelectedMood(mood.id)}
            >
              <span className="emoji">{mood.face}</span>
              <span className="label">{mood.label}</span>
            </button>
          ))}
        </div>

        <label className="note-label" htmlFor="note">
          Заметка
        </label>
        <textarea
          id="note"
          placeholder="Что повлияло на твоё настроение?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />

        <button
          type="button"
          className="save-btn"
          onClick={handleSave}
          disabled={!selectedMood}
        >
          Сохранить
        </button>
      </section>

      <section className="card">
        <h2>Календарь — {monthLabel}</h2>
        <div className="weekdays">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar">
          {calendarCells.map((day, index) => {
            if (!day) return <div key={`empty-${index}`} className="cell empty" />;
            const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(
              2,
              '0'
            )}-${String(day).padStart(2, '0')}`;
            const entry = moodByDate[dateKey];
            const mood = entry
              ? moodOptions.find((item) => item.id === entry.mood)
              : null;
            return (
              <div key={dateKey} className={`cell ${entry ? 'filled' : ''}`}>
                <span className="day">{day}</span>
                {mood && <span className="cell-emoji">{mood.face}</span>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2>История</h2>
        {sortedEntries.length === 0 ? (
          <p className="muted">Пока нет записей. Выбери настроение на сегодня.</p>
        ) : (
          <ul className="entries">
            {sortedEntries.map((entry) => {
              const mood = moodOptions.find((item) => item.id === entry.mood);
              return (
                <li key={entry.date} className="entry">
                  <span className="entry-emoji">{mood?.face}</span>
                  <div>
                    <div className="entry-top">
                      <span className="entry-mood">{mood?.label}</span>
                      <span className="entry-date">{formatDate(entry.date)}</span>
                    </div>
                    <p className="entry-note">
                      {entry.note || 'Без заметки'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default MoodJournal;
