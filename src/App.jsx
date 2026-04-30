import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Mail, Printer, Trash2, Plus, Check, X, FileSignature, Clock, Calendar, User, Save, Smartphone, History, ChevronDown, ChevronUp } from 'lucide-react';

// רכיב לוח החתימה
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
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FileSignature size={20} className="text-teal-400" />
            {title || "חתימה"}
          </h3>
          <button onClick={onCancel} className="text-slate-300 hover:text-white transition-colors bg-slate-700/50 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 bg-slate-50 flex-grow flex flex-col">
          <p className="text-sm text-slate-500 mb-3 text-center">אנא חתום בתוך המסגרת:</p>
          <div className="relative flex-grow bg-white border-2 border-dashed border-teal-300 rounded-2xl overflow-hidden touch-none shadow-inner">
            <canvas ref={canvasRef} onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseOut={finishDrawing} onMouseMove={draw} onTouchStart={startDrawing} onTouchEnd={finishDrawing} onTouchCancel={finishDrawing} onTouchMove={draw} className="absolute inset-0 w-full h-full bg-transparent cursor-crosshair touch-none" />
          </div>
        </div>
        <div className="p-4 flex gap-3 bg-white border-t border-slate-100">
          <button onClick={() => { const canvas = canvasRef.current; canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height); }} className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">נקה מסך</button>
          <button onClick={saveSignature} className="flex-1 py-3 px-4 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-teal-600/20"><Check size={18} /> שמור חתימה</button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [lessons, setLessons] = useState([]);
  const [isSigning, setIsSigning] = useState(false);
  const [signingType, setSigningType] = useState(null); 
  const [errorMsg, setErrorMsg] = useState('');
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [isTailwindLoaded, setIsTailwindLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  
  // מצבי הצהרה וחתימת מורה
  const [isDeclared, setIsDeclared] = useState(false);
  const [teacherSignature, setTeacherSignature] = useState(null);

  const getCurrentMonthString = () => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
  };
  
  const [viewMonth, setViewMonth] = useState(getCurrentMonthString());
  const [availableMonths, setAvailableMonths] = useState([getCurrentMonthString()]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  const [currentName, setCurrentName] = useState('');
  const [currentDuration, setCurrentDuration] = useState('1');
  
  // תיקון בעיית התאריך שזז - שימוש בערכים מקומיים בלבד
  const getDefaultDateForViewMonth = () => {
    const [m, y] = viewMonth.split('-');
    const now = new Date();
    if (parseInt(m) === (now.getMonth() + 1) && parseInt(y) === now.getFullYear()) {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return `${y}-${m}-01`;
  };

  const [currentDate, setCurrentDate] = useState(getDefaultDateForViewMonth());

  const getEndOfViewMonth = () => {
    const [m, y] = viewMonth.split('-');
    return new Date(y, parseInt(m), 0).toISOString().split('T')[0];
  };
  const [declarationDate, setDeclarationDate] = useState(getEndOfViewMonth());

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbynmOheXpJBbRNhd5p7plzWCfv6fzOTupcVBsKz6U353F3fg2YeLsse-eRbEbu_R9HQ/exec';

  // הצעות תלמידים על בסיס נתונים קיימים
  const studentSuggestions = [...new Set(lessons.map(l => l.name))];

  // פורמט תאריך חסין אזורי זמן
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    if (dateStr.includes('/')) return dateStr;
    const cleanDate = dateStr.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const syncWithExcel = async (dataToSync) => {
    setIsSaving(true);
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ month: viewMonth, lessons: dataToSync })
        });
        const result = await response.json();
        if (result.status !== 'success') console.error("Sync error:", result.message);
    } catch (error) { 
        console.error("Connection error:", error); 
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
        // מניעת כפילויות במפתחות על ידי יצירת ID ייחודי
        const sanitized = (result.lessons || []).map((l, i) => ({
          ...l,
          id: l.id || `srv-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`
        }));
        setLessons(sanitized);
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
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentDate(getDefaultDateForViewMonth());
    setDeclarationDate(getEndOfViewMonth());
  }, [viewMonth]);

  useEffect(() => { fetchLessons(viewMonth); }, [viewMonth]);

  useEffect(() => {
    const handleInstall = (e) => { e.preventDefault(); setDeferredPrompt(e); setIsInstallable(true); };
    window.addEventListener('beforeinstallprompt', handleInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleInstall);
  }, []);

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
    setSigningType('student');
    setIsSigning(true);
  };

  const openTeacherSignature = () => {
    if (!isDeclared) return;
    setSigningType('teacher');
    setIsSigning(true);
  };

  const handleSaveSignature = async (signatureData) => {
    const type = signingType;
    setIsSigning(false);
    setSigningType(null);

    if (type === 'student') {
      const uniqueId = `L-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newLesson = {
        id: uniqueId,
        name: currentName,
        duration: currentDuration,
        date: currentDate,
        signature: signatureData
      };
      const updated = [...lessons, newLesson];
      setLessons(updated);
      setCurrentName('');
      setIsTableExpanded(false);
      await syncWithExcel(updated);
    } else if (type === 'teacher') {
      setTeacherSignature(signatureData);
    }
  };

  const confirmDelete = async () => {
    const updated = lessons.filter(l => l.id !== lessonToDelete);
    setLessons(updated);
    setLessonToDelete(null);
    await syncWithExcel(updated);
  };

  const sendEmail = () => {
    const subject = `דיווח שעות - נתנאל - חודש ${viewMonth}`;
    let body = `שלום רב,\nלהלן דיווח השעות שלי לחודש ${viewMonth}:\n\n`;
    lessons.forEach((l, i) => {
      body += `${i + 1}. תלמיד/ה: ${l.name} | משך: ${l.duration} ש' | תאריך: ${formatDisplayDate(l.date)}\n`;
    });
    body += `\nסה"כ שעות: ${lessons.reduce((s, l) => s + parseFloat(l.duration), 0)}\n\n`;
    body += `בברכה,\nנתנאל\n053-5303607`;
    window.open(`mailto:Office@leittner.co.il?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const printReport = () => {
    setIsTableExpanded(true);
    setTimeout(() => { window.print(); }, 100);
  };

  const durations = ['1', '1.25', '1.5', '1.75', '2', '2.25', '2.5', '3'];

  if (!isTailwindLoaded) return <div className="p-10 text-center font-sans">טוען...</div>;
  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
      <h2 className="text-lg font-bold text-slate-700 font-sans">טוען נתונים...</h2>
    </div>
  );

  const displayed = isTableExpanded ? lessons : (lessons.length > 0 ? [lessons[lessons.length - 1]] : []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans print:bg-white pb-20" dir="rtl">
      
      {/* Header */}
      <header className="bg-slate-900 text-white pt-10 pb-6 px-4 shadow-lg rounded-b-3xl print:hidden relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-teal-500/10 pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Leitner Tracker</h1>
              <p className="text-teal-400 text-xs font-medium">ניהול שעות חודשי</p>
            </div>
            <div className="bg-teal-500/20 p-2 rounded-xl"><FileSignature size={24} className="text-teal-300" /></div>
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

      {/* Print Header Logo */}
      <div className="hidden print:flex items-center justify-between mb-8 border-b-2 border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2 rounded-lg">
            <FileSignature size={32} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black">LEITNER TRACKER</h1>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Monthly Attendance Reporting</p>
          </div>
        </div>
        <div className="text-left text-sm font-bold text-slate-700">
           דוח שעות חודשי - {viewMonth}
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 space-y-6 -mt-4 relative z-20">
        
        {/* Form Section */}
        <section className="bg-white rounded-3xl shadow-md border border-slate-100 p-5 print:hidden">
          <h2 className="text-md font-bold text-slate-800 mb-5 flex items-center gap-2">
            <div className="bg-teal-100 text-teal-600 p-1 rounded-lg"><Plus size={16} /></div> הזנה לחודש {viewMonth}
          </h2>
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><User size={14} /> שם תלמיד/ה</label>
              <input 
                list="students-list"
                type="text" 
                value={currentName} 
                onChange={(e) => setCurrentName(e.target.value)} 
                placeholder="הקלד שם או בחר..." 
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none" 
              />
              <datalist id="students-list">
                {studentSuggestions.map(name => <option key={name} value={name} />)}
              </datalist>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><Clock size={14} /> משך</label>
                <select value={currentDuration} onChange={(e) => setCurrentDuration(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none appearance-none">
                  {durations.map(d => <option key={d} value={d}>{d} שעות</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><Calendar size={14} /> תאריך</label>
                <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 outline-none" />
              </div>
            </div>
          </div>
          {errorMsg && <div className="mb-4 text-red-500 text-xs text-center font-bold">{errorMsg}</div>}
          <button onClick={openStudentSignature} className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"><PenTool size={20} /> החתם ושמור</button>
        </section>

        {/* Lessons Table */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none">
          <div className="p-4 bg-slate-800 text-white flex justify-between items-center print:bg-transparent print:text-slate-900 print:mb-4">
            <h2 className="font-bold">טבלת שיעורים</h2>
            {lessons.length > 1 && <button onClick={() => setIsTableExpanded(!isTableExpanded)} className="text-xs bg-slate-700 px-3 py-1.5 rounded-lg print:hidden">{isTableExpanded ? "כווץ" : "הצג הכל"}</button>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-50 text-[10px] border-b">
                <tr>
                  <th className="p-3 border-l w-10 text-center font-black">#</th>
                  <th className="p-3 border-l">תלמיד/ה</th>
                  <th className="p-3 border-l w-16 text-center">משך</th>
                  <th className="p-3 border-l w-24 text-center">תאריך</th>
                  <th className="p-3 text-center">חתימת תלמיד</th>
                  <th className="p-3 print:hidden w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {displayed.map((l, i) => {
                  const actualIdx = lessons.findIndex(item => item.id === l.id);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="p-3 text-center border-l text-slate-400 font-bold">{actualIdx + 1}</td>
                      <td className="p-3 font-bold border-l">{l.name}</td>
                      <td className="p-3 border-l text-center">{l.duration} ש'</td>
                      <td className="p-3 border-l text-center whitespace-nowrap">{formatDisplayDate(l.date)}</td>
                      <td className="p-2"><img src={l.signature} alt="Signature" className="h-10 mx-auto object-contain" /></td>
                      <td className="p-2 text-center print:hidden"><button onClick={() => setLessonToDelete(l.id)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-sm">
                <tr>
                  <td colSpan="2" className="p-3 text-left border-l">סה"כ שעות:</td>
                  <td className="p-3 text-teal-700 text-lg text-center border-l">{lessons.reduce((s, l) => s + parseFloat(l.duration), 0)} ש'</td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Declaration and Teacher Signature */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 print:border-none print:shadow-none print:mt-4">
          <div className="space-y-6">
            <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100 print:bg-white print:border-none print:p-0">
              <div className="flex items-start gap-4 mb-4">
                <div className="pt-1 print:hidden">
                  <input 
                    type="checkbox" 
                    id="declare-check" 
                    checked={isDeclared}
                    onChange={(e) => setIsDeclared(e.target.checked)}
                    className="w-6 h-6 accent-teal-600 rounded cursor-pointer"
                  />
                </div>
                <label htmlFor="declare-check" className="text-[13px] font-bold text-slate-700 leading-relaxed cursor-pointer select-none">
                   אני מצהיר בזה כי כל הפרטים הרשומים לעיל הינם נכונים ומדויקים למיטב ידיעתי, וכי כל שעות ההוראה המדווחות בוצעו בפועל כנדרש.
                </label>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
                <div className="text-sm text-slate-500 space-y-1">
                  <p><strong>מורה מדווח:</strong> נתנאל</p>
                  <p><strong>טלפון:</strong> 053-5303607</p>
                  <div className="flex items-center gap-2 pt-2 print:hidden">
                    <span className="font-bold text-xs text-slate-600">תאריך:</span>
                    <input type="date" value={declarationDate} onChange={(e) => setDeclarationDate(e.target.value)} className="p-1 rounded border text-[10px] outline-none" />
                  </div>
                  <p className="hidden print:block pt-1"><strong>תאריך דיווח:</strong> {formatDisplayDate(declarationDate)}</p>
                </div>

                <div className="w-full sm:w-48 text-center space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">חתימת מורה</p>
                  <div className="h-24 bg-white border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden relative group">
                    {teacherSignature ? (
                      <img src={teacherSignature} alt="Teacher Signature" className="h-full object-contain" />
                    ) : (
                      <button 
                        onClick={openTeacherSignature}
                        disabled={!isDeclared}
                        className="w-full h-full text-slate-300 hover:text-teal-500 hover:bg-teal-50 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <PenTool size={20} />
                        <span className="text-[10px] font-bold">לחץ לחתימה</span>
                      </button>
                    )}
                    {teacherSignature && (
                      <button 
                        onClick={() => setTeacherSignature(null)}
                        className="absolute top-1 left-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 print:hidden pt-2">
              <button onClick={sendEmail} disabled={lessons.length === 0 || !teacherSignature} className="flex-1 py-4 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"><Mail size={20} /> שלח במייל</button>
              <button onClick={printReport} disabled={lessons.length === 0 || !teacherSignature} className="flex-1 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 disabled:opacity-50 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"><Printer size={20} /> הדפס דוח PDF</button>
            </div>
            {isSaving && <div className="text-center text-[10px] text-teal-600 animate-pulse font-black tracking-widest">סנכרון נתונים פעיל...</div>}
          </div>
        </section>
      </main>

      {/* Signature Modals */}
      {isSigning && (
        <SignaturePad 
          title={signingType === 'student' ? `חתימת תלמיד/ה: ${currentName}` : "חתימת מורה: נתנאל"} 
          onSave={handleSaveSignature} 
          onCancel={() => { setIsSigning(false); setSigningType(null); }} 
        />
      )}
      
      {/* Delete Confirmation */}
      {lessonToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl w-full max-w-xs border border-slate-100">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <Trash2 size={32} />
             </div>
            <h3 className="font-bold text-lg mb-2 text-slate-800 font-sans">מחיקת שיעור?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed font-sans">האם אתה בטוח שברצונך למחוק את הדיווח עבור {lessons.find(l => l.id === lessonToDelete)?.name}?</p>
            <div className="flex gap-3">
              <button onClick={() => setLessonToDelete(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors font-sans text-xs">ביטול</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition-all font-sans text-xs">מחק</button>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:flex { display: flex !important; }
          .print\\:block { display: block !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          @page { margin: 1cm; }
        }
      `}} />
    </div>
  );
}