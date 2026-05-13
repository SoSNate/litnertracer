import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Mail, Printer, Plus, Check, X, FileSignature, Clock, Calendar, User, Save, History, Users, Laptop, Briefcase, DollarSign, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const SignaturePad = ({ onSave, onCancel, title }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const pointsRef = useRef([]); 
  const [isDrawing, setIsDrawing] = useState(false);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.lineJoin = "round"; 
    context.strokeStyle = "#0f766e"; 
    context.lineWidth = 3;
    contextRef.current = context;
  };

  useEffect(() => {
    const handleResize = () => setTimeout(resizeCanvas, 50);
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (event.touches && event.touches.length > 0) {
      return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
    }
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startDrawing = (event) => {
    event.preventDefault(); 
    const { x, y } = getCoordinates(event);
    pointsRef.current = [{ x, y }];
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    contextRef.current.closePath();
    pointsRef.current = [];
    setIsDrawing(false);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    event.preventDefault();
    const { x, y } = getCoordinates(event);
    const points = pointsRef.current;
    points.push({ x, y });
    const ctx = contextRef.current;
    if (points.length >= 3) {
      const lastTwo = points.slice(-2);
      const controlPoint = lastTwo[0];
      const endPoint = {
        x: (lastTwo[0].x + lastTwo[1].x) / 2,
        y: (lastTwo[0].y + lastTwo[1].y) / 2,
      };
      ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(endPoint.x, endPoint.y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:hidden" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-md h-[450px] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2 font-sans text-right">
            <FileSignature size={20} className="text-teal-400" />
            {title || "חתימה"}
          </h3>
          <button onClick={onCancel} className="text-slate-300 hover:text-white transition-colors bg-slate-700/50 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 bg-slate-50 flex-grow flex flex-col text-right">
          <p className="text-sm text-slate-500 mb-3 text-center font-sans">חתום בתוך המסגרת:</p>
          <div className="relative flex-grow bg-white border-2 border-dashed border-teal-300 rounded-2xl overflow-hidden touch-none shadow-inner">
            <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseOut={finishDrawing} onMouseMove={draw} onTouchStart={startDrawing} onTouchEnd={finishDrawing} onTouchCancel={finishDrawing} onTouchMove={draw} className="absolute inset-0 w-full h-full bg-transparent cursor-crosshair touch-none" />
          </div>
        </div>
        <div className="p-4 flex gap-3 bg-white border-t border-slate-100">
          <button onClick={() => { const canvas = canvasRef.current; canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height); }} className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors font-sans">נקה</button>
          <button onClick={saveSignature} className="flex-1 py-3 px-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 font-sans"><Check size={18} /> שמור</button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [lessons, setLessons] = useState([]);
  const [isSigning, setIsSigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTailwindLoaded, setIsTailwindLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  
  // State for Editing
  const [editingIndex, setEditingIndex] = useState(null);

  const getCurrentMonthString = () => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };
  
  const [viewMonth, setViewMonth] = useState(getCurrentMonthString());
  const [availableMonths, setAvailableMonths] = useState([getCurrentMonthString()]);
  
  const [currentName, setCurrentName] = useState('');
  const [currentDuration, setCurrentDuration] = useState('1');
  const [currentType, setCurrentType] = useState('פרונטלי');
  const [currentRate, setCurrentRate] = useState('90');
  
  const getLocalDateString = (d = new Date()) => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [currentDate, setCurrentDate] = useState(getLocalDateString());

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbynmOheXpJBbRNhd5p7plzWCfv6fzOTupcVBsKz6U353F3fg2YeLsse-eRbEbu_R9HQ/exec';

  const studentSuggestions = [...new Set(lessons.map(l => l.name))];

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes('/')) return dateStr;
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const calculateLessonIncome = (duration, rate) => parseFloat(duration) * parseFloat(rate || 0);

  // סנכרון רגיל - ללא מיון אוטומטי כדי לשמור על סדר ידני (Move Up/Down)
  const syncWithExcel = async (dataToSync) => {
    setIsSaving(true);
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ month: viewMonth, lessons: dataToSync })
        });
        const result = await response.json();
        if (result.status !== 'success') console.error("Sync error");
    } catch (error) { 
        console.error("Connection error"); 
    } finally { 
        setIsSaving(false); 
    }
  };

  const fetchLessons = async (monthToFetch) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?month=${monthToFetch}`);
      const result = await response.json();
      if (result.status === 'success') {
        const data = (result.lessons || []).map((l, i) => ({
          ...l,
          _reactKey: `srv-${Date.now()}-${i}`
        }));
        setLessons(data);
        if (result.availableMonths) {
          const all = Array.from(new Set([getCurrentMonthString(), ...result.availableMonths]));
          all.sort((a, b) => {
            const [m1, y1] = a.split('-');
            const [m2, y2] = b.split('-');
            return new Date(y2, m2 - 1) - new Date(y1, m1 - 1);
          });
          setAvailableMonths(all);
        }
      }
    } catch (error) {
      console.error("Fetch error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const [m, y] = viewMonth.split('-');
    const now = new Date();
    if (parseInt(m) === (now.getMonth() + 1) && parseInt(y) === now.getFullYear()) {
        setCurrentDate(getLocalDateString());
    } else {
        setCurrentDate(`${y}-${m}-01`);
    }
    fetchLessons(viewMonth);
  }, [viewMonth]);

  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      script.onload = () => setIsTailwindLoaded(true);
      document.head.appendChild(script);
    } else { setIsTailwindLoaded(true); }
  }, []);

  const openStudentSignature = () => {
    if (!currentName.trim()) {
      setErrorMsg("חובה להזין שם תלמיד/ה");
      return;
    }
    setErrorMsg('');
    setIsSigning(true);
  };

  const handleSaveLesson = async (signatureData) => {
    setIsSigning(false);
    
    const newLesson = {
      _reactKey: `L-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: currentName,
      duration: currentDuration,
      date: currentDate,
      type: currentType,
      rate: currentRate,
      signature: signatureData
    };
    
    // מוסיף לסוף הרשימה (ללא מיון אוטומטי)
    const updated = [...lessons, newLesson];
    setLessons(updated);
    setCurrentName('');
    setIsTableExpanded(false);
    await syncWithExcel(updated);
  };

  // --- פונקציות ניהול ועריכת שורות ---
  
  const startEdit = (index) => {
    const lesson = lessons[index];
    setCurrentName(lesson.name);
    setCurrentDuration(lesson.duration);
    setCurrentDate(lesson.date);
    setCurrentType(lesson.type || 'פרונטלי');
    setCurrentRate(lesson.rate || '90');
    setEditingIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // גלילה מעלה לטופס
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setCurrentName('');
  };

  const submitEdit = async () => {
    if (!currentName.trim()) {
      setErrorMsg("חובה להזין שם תלמיד/ה");
      return;
    }
    setErrorMsg('');
    const updated = [...lessons];
    updated[editingIndex] = {
      ...updated[editingIndex],
      name: currentName,
      duration: currentDuration,
      date: currentDate,
      type: currentType,
      rate: currentRate,
    }; // שומר על החתימה הישנה והמזהה
    
    setLessons(updated);
    setEditingIndex(null);
    setCurrentName('');
    await syncWithExcel(updated);
  };

  const deleteLesson = async (index) => {
    if (!window.confirm("בטוח שברצונך למחוק את השיעור?")) return;
    const updated = lessons.filter((_, i) => i !== index);
    setLessons(updated);
    await syncWithExcel(updated);
  };

  const moveRow = async (index, direction) => {
    const updated = [...lessons];
    const target = index + direction;
    if (target < 0 || target >= updated.length) return; // מחוץ לגבולות
    
    // החלפת מקומות
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setLessons(updated);
    await syncWithExcel(updated);
  };

  // --- סוף פונקציות ניהול ---

  const getEmailSubjectAndBody = () => {
    const subject = `דיווח שעות חודשי - נתנאל - חודש ${viewMonth}`;
    let lessonsText = "";
    lessons.forEach((l, index) => {
        lessonsText += `${index + 1}. תלמיד: ${l.name} | תאריך: ${formatDisplayDate(l.date)} | סוג: ${l.type || "פרונטלי"} | תעריף: ₪${l.rate || "90"} | משך: ${l.duration} ש'\n`;
    });
    const totalHours = lessons.reduce((sum, l) => sum + parseFloat(l.duration), 0);
    const totalIncome = lessons.reduce((sum, l) => sum + calculateLessonIncome(l.duration, l.rate), 0);
    
    const body = `שלום רב,\n\nלהלן פירוט שעות ההוראה שלי לחודש ${viewMonth} (מערכת Leittner Tracker):\n\n${lessonsText}\nסה"כ שעות בחודש זה: ${totalHours} ש'\nסה"כ לתשלום: ${totalIncome} ₪\n\nבברכה,\nנתנאל\n053-5303607`;
    
    return { subject, body };
  };

  const handleFinalSubmit = () => {
    const { subject, body } = getEmailSubjectAndBody();
    const bodyWithPdfNote = body + `\n\n(דוח PDF מפורט עם חתימות נשמר במכשירך - נא לצרפו למייל)`;
    
    window.print();
    setTimeout(() => {
        window.open(`mailto:Office@leittner.co.il?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyWithPdfNote)}`);
    }, 1000);
  };

  const handleSendEmailOnly = () => {
    const { subject, body } = getEmailSubjectAndBody();
    window.open(`mailto:Office@leittner.co.il?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const durations = ['1', '1.25', '1.5', '1.75', '2', '2.25', '2.5', '3'];
  const sessionTypes = ['פרונטלי', 'אונליין', 'פרויקט'];

  const totalMonthlyHours = lessons.reduce((sum, l) => sum + parseFloat(l.duration), 0);
  const totalMonthlyIncome = lessons.reduce((sum, l) => sum + calculateLessonIncome(l.duration, l.rate), 0);

  if (!isTailwindLoaded) return <div className="p-10 text-center font-sans">טוען...</div>;

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
      <h2 className="text-lg font-bold text-slate-700 font-sans tracking-tight">מסנכרן נתונים...</h2>
    </div>
  );

  const displayed = isTableExpanded ? lessons : (lessons.length > 0 ? [lessons[lessons.length - 1]] : []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans print:bg-white pb-20" dir="rtl">
      
      {/* App Header */}
      <header className="bg-slate-900 text-white pt-10 pb-6 px-4 shadow-lg rounded-b-3xl print:hidden relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-teal-500/10 pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Leittner Tracker</h1>
              <p className="text-teal-400 text-xs font-medium italic">אזור אישי - נתנאל</p>
            </div>
            <div className="bg-teal-500/20 p-2 rounded-xl border border-teal-500/30 shadow-inner shadow-teal-500/10">
                <FileSignature size={24} className="text-teal-300" />
            </div>
          </div>
          <div className="bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/50 inline-flex items-center gap-2 self-start">
            <History size={16} className="text-slate-400 mr-2" />
            <select value={viewMonth} onChange={(e) => setViewMonth(e.target.value)} className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer appearance-none pl-4 pr-1">
              {availableMonths.map(m => (
                <option key={`month-${m}`} value={m} className="bg-slate-800 text-white">חודש {m}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Official Print Header */}
      <div className="hidden print:flex items-center justify-between mb-8 border-b-2 border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-lg">
            <FileSignature size={32} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black tracking-tight">LEITTNER TRACKER</h1>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase font-sans">Monthly Attendance & Activity Report</p>
          </div>
        </div>
        <div className="text-left text-sm font-bold text-slate-700 font-sans">
           דוח חודשי: {viewMonth}
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 space-y-6 -mt-4 relative z-20">
        
        {/* Form Section */}
        <section className={`bg-white rounded-3xl shadow-md border p-5 print:hidden transition-colors ${editingIndex !== null ? 'border-amber-300 bg-amber-50/30' : 'border-slate-100'}`}>
          <h2 className="text-md font-bold text-slate-800 mb-5 flex items-center gap-2 tracking-tight font-sans">
            <div className={`p-1 rounded-lg ${editingIndex !== null ? 'bg-amber-100 text-amber-600' : 'bg-teal-100 text-teal-600'}`}>
                {editingIndex !== null ? <Pencil size={16} /> : <Plus size={16} />}
            </div> 
            {editingIndex !== null ? 'עריכת שיעור קיים' : `הזנת שיעור חדש - חודש ${viewMonth}`}
          </h2>
          
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1 font-sans"><User size={14} /> שם תלמיד/ה</label>
              <input 
                list="students-list"
                type="text" 
                value={currentName} 
                onChange={(e) => setCurrentName(e.target.value)} 
                placeholder="הקלד שם או בחר מהרשימה..." 
                className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-sans" 
              />
              <datalist id="students-list">
                {studentSuggestions.map(name => <option key={`sug-${name}`} value={name} />)}
              </datalist>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1 font-sans"><Clock size={14} /> משך</label>
                <select value={currentDuration} onChange={(e) => setCurrentDuration(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none appearance-none font-medium font-sans">
                  {durations.map(d => <option key={d} value={d}>{d} שעות</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1 font-sans"><Calendar size={14} /> תאריך</label>
                <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium font-sans" />
              </div>
            </div>

            {/* Classification and Rate Toggle */}
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                    <label className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1 font-sans"><Briefcase size={14} /> סיווג מפגש</label>
                    <div className="grid grid-cols-3 gap-2">
                        {sessionTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => { setCurrentType(type); if(type === 'אונליין') setCurrentRate('80'); else setCurrentRate('90'); }}
                                className={`py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1 ${currentType === type ? 'bg-teal-600 border-teal-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500'}`}
                            >
                                {type === 'פרונטלי' && <Users size={12} />}
                                {type === 'אונליין' && <Laptop size={12} />}
                                {type === 'פרויקט' && <Briefcase size={12} />}
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="col-span-1">
                    <label className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1 font-sans"><DollarSign size={14} /> תעריף</label>
                    <input 
                        type="number" 
                        value={currentRate} 
                        onChange={(e) => setCurrentRate(e.target.value)} 
                        className="w-full py-2 px-1 text-center font-bold text-slate-700 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-sans" 
                    />
                </div>
            </div>
          </div>
          
          {errorMsg && <div className="mb-4 text-red-500 text-xs text-center font-bold font-sans">{errorMsg}</div>}
          
          {editingIndex !== null ? (
            <div className="flex gap-2">
                <button onClick={submitEdit} className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-sm font-sans">שמור עדכון</button>
                <button onClick={cancelEdit} className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-bold transition-all text-sm font-sans">ביטול עריכה</button>
            </div>
          ) : (
            <button onClick={openStudentSignature} className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-lg font-sans border-b-4 border-teal-800"><PenTool size={22} /> החתם ושמור שיעור</button>
          )}
        </section>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-4 print:hidden">
            <div className="bg-slate-800 text-white p-4 rounded-3xl flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Clock size={40} /></div>
                <span className="text-xs text-slate-400 font-bold tracking-widest mb-1 z-10">שעות החודש</span>
                <span className="text-3xl font-black z-10">{totalMonthlyHours}</span>
            </div>
            <div className="bg-teal-600 text-white p-4 rounded-3xl flex flex-col justify-center items-center shadow-lg shadow-teal-600/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><DollarSign size={40} /></div>
                <span className="text-xs text-teal-100 font-bold tracking-widest mb-1 z-10">צפי הכנסה</span>
                <span className="text-3xl font-black z-10">₪{totalMonthlyIncome}</span>
            </div>
        </div>

        {/* Lessons Table */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 bg-slate-800 text-white flex justify-between items-center print:bg-transparent print:text-slate-900 print:mb-4 print:p-0 print:border-b-2 print:border-slate-100">
            <h2 className="font-bold flex items-center gap-2 tracking-tight font-sans">
                פירוט שיעורים 
                <span className="bg-slate-700 print:bg-slate-100 print:text-slate-500 text-teal-300 text-[10px] px-2 py-0.5 rounded-full font-bold font-sans">{lessons.length}</span>
            </h2>
            {lessons.length > 1 && <button onClick={() => setIsTableExpanded(!isTableExpanded)} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg print:hidden transition-colors font-sans">{isTableExpanded ? "כווץ רשימה" : "הצג הכל"}</button>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-50 text-[10px] border-b text-slate-400 uppercase font-black font-sans">
                <tr>
                  <th className="p-3 border-l w-10 text-center font-sans">#</th>
                  <th className="p-3 border-l font-sans">תלמיד/ה</th>
                  <th className="p-3 border-l w-16 text-center font-sans">סיווג</th>
                  <th className="p-3 border-l w-16 text-center font-sans">משך</th>
                  <th className="p-3 border-l w-24 text-center font-sans">תאריך</th>
                  <th className="p-3 text-center font-sans">חתימה</th>
                  <th className="p-2 text-center print:hidden w-20">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] font-sans">
                {displayed.map((l, index) => {
                  // כדי שנדע איזה אינדקס אמיתי לערוך/למחוק גם כשהטבלה מכווצת
                  const actualIdx = lessons.findIndex(item => item._reactKey === l._reactKey);
                  
                  return (
                    <tr key={l._reactKey} className={`transition-colors ${editingIndex === actualIdx ? 'bg-amber-50' : 'hover:bg-slate-50'}`}>
                      <td className="p-3 text-center border-l text-slate-400 font-bold font-sans">{actualIdx + 1}</td>
                      <td className="p-3 font-bold border-l text-slate-700 font-sans">{l.name}</td>
                      <td className="p-3 border-l text-center font-medium text-slate-500 font-sans text-[11px]">
                          {l.type || "פרונטלי"}
                          <div className="text-[9px] text-teal-600">₪{l.rate || "90"}/ש'</div>
                      </td>
                      <td className="p-3 border-l text-center font-medium font-sans">{l.duration} ש'</td>
                      <td className="p-3 border-l text-center whitespace-nowrap font-medium font-sans">{formatDisplayDate(l.date)}</td>
                      <td className="p-2"><img src={l.signature} alt="Sig" className="h-10 mx-auto object-contain" /></td>
                      
                      {/* Action Buttons (Hidden on Print) */}
                      <td className="p-2 text-center print:hidden border-r bg-slate-50/50">
                        <div className="flex flex-col gap-1 items-center justify-center">
                            <div className="flex gap-1">
                                <button onClick={() => moveRow(actualIdx, -1)} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"><ArrowUp size={14}/></button>
                                <button onClick={() => moveRow(actualIdx, 1)} className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors"><ArrowDown size={14}/></button>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => startEdit(actualIdx)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Pencil size={14}/></button>
                                <button onClick={() => deleteLesson(actualIdx)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14}/></button>
                            </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-sm font-sans">
                <tr>
                  <td colSpan="3" className="p-4 text-left border-l text-slate-600 font-sans">סה"כ לחודש זה:</td>
                  <td className="p-4 text-teal-700 text-lg text-center border-l bg-teal-50/30 font-black font-sans">{totalMonthlyHours} ש'</td>
                  <td colSpan="3" className="p-4 text-center text-teal-700 text-lg bg-teal-50/50 font-black font-sans">₪{totalMonthlyIncome}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Action Bottom */}
        <section className="print:hidden pt-4 flex flex-col gap-3">
            <button 
                onClick={handleFinalSubmit} 
                disabled={lessons.length === 0} 
                className="w-full py-4 bg-slate-900 hover:bg-black disabled:opacity-50 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-xl transition-all active:scale-[0.98] font-sans border-b-4 border-slate-700"
            >
                <div className="flex items-center gap-2 text-lg font-sans">
                    <Printer size={20} className="text-teal-400 font-sans" /> הורד PDF + שלח דוח
                </div>
            </button>
            <button 
                onClick={handleSendEmailOnly} 
                disabled={lessons.length === 0} 
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold flex flex-col items-center justify-center gap-1 shadow-xl transition-all active:scale-[0.98] font-sans border-b-4 border-teal-800"
            >
                <div className="flex items-center gap-2 text-lg font-sans">
                    <Mail size={20} className="text-white font-sans" /> שלח טקסט בלבד למשרד
                </div>
            </button>
            {isSaving && <div className="text-center mt-2 text-[10px] text-teal-600 animate-pulse font-black tracking-widest uppercase font-sans">מגבה נתונים לענן...</div>}
        </section>

      </main>

      {isSigning && (
        <SignaturePad 
          title={`חתימת תלמיד/ה: ${currentName}`} 
          onSave={handleSaveLesson} 
          onCancel={() => setIsSigning(false)} 
        />
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; direction: rtl; }
          .print\\:hidden { display: none !important; }
          .print\\:flex { display: flex !important; }
          .print\\:block { display: block !important; }
          table { page-break-inside: auto; border-collapse: collapse; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          @page { margin: 1cm; size: a4; }
        }
      `}} />
    </div>
  );
}