import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Mail, Printer, Trash2, Plus, Check, X, FileSignature, Clock, Calendar, User } from 'lucide-react';

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
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    }
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm print:hidden" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-2xl h-[85vh] sm:h-[60vh] max-h-[600px] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-slate-800 text-white p-4 sm:p-5 flex justify-between items-center">
          <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
            <FileSignature size={20} className="text-teal-400" />
            {title || "חתימה"}
          </h3>
          <button onClick={onCancel} className="text-slate-300 hover:text-white transition-colors bg-slate-700/50 p-2 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-3 sm:p-5 bg-slate-50 flex-grow flex flex-col">
          <p className="text-xs sm:text-sm text-slate-500 mb-2 text-center">סובב את המכשיר לרוחב וחתום בתוך המסגרת:</p>
          <div className="relative flex-grow bg-white border-2 border-dashed border-teal-300 rounded-2xl overflow-hidden touch-none shadow-inner">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseUp={finishDrawing}
              onMouseOut={finishDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={finishDrawing}
              onTouchCancel={finishDrawing}
              onTouchMove={draw}
              className="absolute inset-0 w-full h-full bg-transparent cursor-crosshair touch-none"
            />
          </div>
        </div>

        <div className="p-3 sm:p-4 flex gap-3 bg-white border-t border-slate-100">
          <button 
            onClick={clearCanvas}
            className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
          >
            נקה מסך
          </button>
          <button 
            onClick={saveSignature}
            className="flex-1 py-3 px-4 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-teal-600/20"
          >
            <Check size={18} /> שמור חתימה
          </button>
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
  
  const [currentName, setCurrentName] = useState('');
  const [currentDuration, setCurrentDuration] = useState('1');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [teacherSignature, setTeacherSignature] = useState(null);

  const durations = ['1', '1.25', '1.5', '1.75', '2', '2.25', '2.5', '3'];

  // הזרקת Tailwind CSS בצורה אוטומטית כדי לוודא עיצוב תקין בכל סביבה
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      script.onload = () => setIsTailwindLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsTailwindLoaded(true);
    }
  }, []);

  const openStudentSignature = () => {
    if (!currentName.trim()) {
      setErrorMsg("שים לב: חובה להזין שם תלמיד/ה לפני החתימה");
      return;
    }
    setErrorMsg('');
    setSigningType('student');
    setIsSigning(true);
  };

  const openTeacherSignature = () => {
    setSigningType('teacher');
    setIsSigning(true);
  };

  const handleSaveSignature = (signatureData) => {
    if (signingType === 'student') {
      const newLesson = {
        id: Date.now(),
        name: currentName,
        duration: currentDuration,
        date: currentDate,
        signature: signatureData
      };
      setLessons([...lessons, newLesson]);
      setCurrentName(''); 
    } else if (signingType === 'teacher') {
      setTeacherSignature(signatureData);
    }
    setIsSigning(false);
    setSigningType(null);
  };

  const confirmDelete = () => {
    setLessons(lessons.filter(l => l.id !== lessonToDelete));
    setLessonToDelete(null);
  };

  const sendEmail = () => {
    const subject = `דיווח שעות חודשי - נתנאל (${new Date().getMonth() + 1}/${new Date().getFullYear()})`;
    let body = `שלום רב,\nלהלן דיווח השעות שלי לחודש זה:\n\n`;
    
    lessons.forEach((lesson, index) => {
      const [year, month, day] = lesson.date.split('-');
      body += `${index + 1}. תלמיד/ה: ${lesson.name} | משך: ${lesson.duration} שעות | תאריך: ${day}/${month}/${year}\n`;
    });

    body += `\nסה"כ שיעורים: ${lessons.length}\n`;
    
    const totalHours = lessons.reduce((sum, lesson) => sum + parseFloat(lesson.duration), 0);
    body += `סה"כ שעות: ${totalHours}\n\n`;

    body += `אני מצהיר שכל הפרטים הכתובים בדף זה הינם נכונים ומאשר אותם.\n`;
    body += `בברכה,\nנתנאל\nטלפון: 053-5303607\nמייל: 12natanel@gmail.com`;

    window.open(`mailto:Office@leittner.co.il?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const printReport = () => {
    window.print();
  };

  // מסך טעינה קצר עד שהעיצוב יורד מהאינטרנט
  if (!isTailwindLoaded) {
    return <div dir="rtl" style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>טוען עיצוב...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans print:bg-white pb-20" dir="rtl">
      
      {/* Header */}
      <header className="bg-slate-900 text-white pt-12 pb-6 px-6 shadow-lg rounded-b-3xl print:hidden relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-teal-500/10 pointer-events-none"></div>
        <div className="max-w-3xl mx-auto flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">מעקב שיעורים</h1>
            <p className="text-teal-400 text-sm mt-1 font-medium">לייטנר - דיווח חודשי</p>
          </div>
          <div className="bg-teal-500/20 text-teal-300 p-3 rounded-2xl backdrop-blur-sm">
            <FileSignature size={28} />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 md:p-6 space-y-6 -mt-4 relative z-20">
        
        {/* Form Section */}
        <section className="bg-white rounded-3xl shadow-md border border-slate-100 p-5 print:hidden">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <div className="bg-teal-100 text-teal-600 p-1.5 rounded-lg"><Plus size={18} /></div>
            הזנת שיעור חדש
          </h2>
          
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <User size={16} className="text-slate-400" /> שם תלמיד/ה
              </label>
              <input 
                type="text" 
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                placeholder="הקלד שם תלמיד..."
                className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition outline-none text-base"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Clock size={16} className="text-slate-400" /> משך 
                </label>
                <div className="relative">
                  <select 
                    value={currentDuration}
                    onChange={(e) => setCurrentDuration(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition outline-none appearance-none font-medium text-base"
                  >
                    {durations.map(d => <option key={d} value={d}>{d} שעות</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={16} className="text-slate-400" /> תאריך
                </label>
                <input 
                  type="date" 
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition outline-none font-medium text-base"
                />
              </div>
            </div>
          </div>
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center justify-center">
              {errorMsg}
            </div>
          )}
          
          <button 
            onClick={openStudentSignature}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
          >
            <PenTool size={22} /> החתם תלמיד ושמור
          </button>
        </section>

        {/* Print Header - Visible only when printing */}
        <div className="hidden print:block text-center mb-10 border-b-2 border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-slate-900">דוח שעות חודשי - לייטנר</h1>
          <div className="flex justify-center gap-8 mt-4 text-slate-700 text-lg">
            <p><strong>מגיש:</strong> נתנאל</p>
            <p><strong>טלפון:</strong> 053-5303607</p>
            <p><strong>חודש דיווח:</strong> {new Date().getMonth() + 1}/{new Date().getFullYear()}</p>
          </div>
        </div>

        {/* Lessons Table */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden print:border-none print:shadow-none">
          <div className="p-5 bg-slate-800 text-white flex justify-between items-center print:bg-transparent print:text-slate-900 print:p-0 print:mb-4">
            <h2 className="font-bold text-lg">טבלת שיעורים</h2>
            <span className="bg-slate-700 print:bg-slate-100 text-teal-300 print:text-slate-800 py-1 px-3 rounded-full text-sm font-bold">
              {lessons.length} שיעורים
            </span>
          </div>
          
          {lessons.length === 0 ? (
            <div className="p-10 text-center text-slate-400 print:hidden flex flex-col items-center gap-3">
              <div className="bg-slate-50 p-4 rounded-full">
                <FileSignature size={32} className="text-slate-300" />
              </div>
              <p>הטבלה ריקה. הוסף שיעור ראשון.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200 print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                  <tr>
                    <th className="p-4 font-bold border-l print:border-slate-300 w-12 text-center">#</th>
                    <th className="p-4 font-bold border-l print:border-slate-300">תלמיד/ה</th>
                    <th className="p-4 font-bold border-l print:border-slate-300 w-24">משך</th>
                    <th className="p-4 font-bold border-l print:border-slate-300 w-32">תאריך</th>
                    <th className="p-4 font-bold print:border-slate-300">חתימה</th>
                    <th className="p-4 font-bold print:hidden w-16 text-center">מחק</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                  {lessons.map((lesson, idx) => {
                    const [year, month, day] = lesson.date.split('-');
                    return (
                      <tr key={lesson.id} className="hover:bg-teal-50/50 transition-colors">
                        <td className="p-4 text-slate-500 text-center font-medium border-l print:border-slate-300">{idx + 1}</td>
                        <td className="p-4 font-bold text-slate-800 border-l print:border-slate-300">{lesson.name}</td>
                        <td className="p-4 text-slate-600 font-medium border-l print:border-slate-300">{lesson.duration} ש'</td>
                        <td className="p-4 text-slate-600 font-medium border-l print:border-slate-300">{`${day}/${month}/${year.slice(2)}`}</td>
                        <td className="p-3 border-l print:border-slate-300 align-middle">
                          <img src={lesson.signature} alt="חתימה" className="h-12 md:h-14 w-full max-w-[120px] object-contain mx-auto" />
                        </td>
                        <td className="p-4 print:hidden text-center">
                          <button 
                            onClick={() => setLessonToDelete(lesson.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors inline-flex"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-200 print:border-slate-800">
                  <tr>
                    <td colSpan="2" className="p-4 text-left border-l print:border-slate-300">סה"כ שעות:</td>
                    <td className="p-4 border-l print:border-slate-300 text-teal-700 print:text-slate-900">
                      {lessons.reduce((sum, lesson) => sum + parseFloat(lesson.duration), 0)} ש'
                    </td>
                    <td colSpan="3" className="p-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        {/* Declaration and Actions */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 print:border-none print:shadow-none print:mt-10">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800 mb-3 text-lg">הצהרת נכונות נתונים</h3>
            <p className="text-slate-700 text-sm bg-slate-50 p-5 rounded-2xl border border-slate-100 leading-relaxed print:border-none print:p-0 print:bg-transparent print:text-base">
              אני מצהיר/ה שכל הפרטים הכתובים בדוח זה הינם נכונים ומאשר/ת אותם.
              <br/><br/>
              <strong>שם:</strong> נתנאל &nbsp;|&nbsp;
              <strong>טלפון:</strong> 053-5303607 &nbsp;|&nbsp;
              <strong>מייל:</strong> 12natanel@gmail.com
            </p>
            
            <div className="mt-5 flex items-center gap-4 print:hidden">
              {!teacherSignature ? (
                <button 
                  onClick={openTeacherSignature}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md shadow-slate-800/20"
                >
                  <PenTool size={16} /> הוסף את החתימה שלך
                </button>
              ) : (
                <div className="flex items-center gap-4 bg-teal-50 p-3 rounded-2xl border border-teal-100">
                  <span className="text-sm font-bold text-teal-800">חתימתך:</span>
                  <img src={teacherSignature} alt="חתימת מורה" className="h-14 object-contain" />
                  <button onClick={() => setTeacherSignature(null)} className="text-sm px-3 py-1 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-colors">מחק חתימה</button>
                </div>
              )}
            </div>
            
            {/* Signature visible only in print */}
            <div className="hidden print:block mt-10 text-center w-64">
                <p className="text-lg font-bold text-slate-800 mb-4 border-t-2 border-slate-300 pt-2">חתימת המורה (נתנאל):</p>
                {teacherSignature ? (
                  <img src={teacherSignature} alt="חתימת מורה" className="h-20 mx-auto" />
                ) : (
                  <div className="h-20 w-full"></div>
                )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 print:hidden pt-4">
            <button 
              onClick={sendEmail}
              disabled={lessons.length === 0}
              className="flex-1 py-4 px-4 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-lg"
            >
              <Mail size={22} /> פתח טיוטת מייל
            </button>
            <button 
              onClick={printReport}
              disabled={lessons.length === 0}
              className="flex-1 py-4 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:border-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-lg"
            >
              <Printer size={22} /> הדפס / PDF
            </button>
          </div>
        </section>

      </main>

      {/* Signature Modal */}
      {isSigning && (
        <SignaturePad 
          title={signingType === 'student' ? `חתימת תלמיד/ה: ${currentName}` : "חתימה אישית (נתנאל)"}
          onSave={handleSaveSignature} 
          onCancel={() => {
            setIsSigning(false);
            setSigningType(null);
          }} 
        />
      )}

      {/* Delete Confirmation Modal */}
      {lessonToDelete && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:hidden" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">מחיקת שיעור</h3>
            <p className="text-slate-600 mb-6">האם אתה בטוח שברצונך למחוק שיעור זה? פעולה זו אינה הפיכה.</p>
            <div className="flex gap-3">
              <button onClick={() => setLessonToDelete(null)} className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                ביטול
              </button>
              <button onClick={confirmDelete} className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">
                מחק שיעור
              </button>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:bg-transparent { background-color: transparent !important; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          @page { margin: 1.5cm; }
        }
      `}} />
    </div>
  );
}