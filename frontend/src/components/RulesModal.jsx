import React, { useState } from 'react';
import { X, Search, Printer, Download, BookOpen, ShieldAlert, CheckCircle2 } from 'lucide-react';

const SRKR_RULES = [
  {
    num: 1,
    title: "Attendance",
    points: [
      "Students must maintain the minimum attendance percentage prescribed by the college and university.",
      "Students should attend all lectures, laboratories, tutorials, seminars, and examinations regularly.",
      "Students who are absent must provide a valid reason and supporting documentation when required.",
      "Students should be punctual and avoid entering classes late."
    ]
  },
  {
    num: 2,
    title: "Discipline and Conduct",
    points: [
      "Students must maintain discipline and behave respectfully with faculty, staff, visitors, and fellow students.",
      "Fighting, threatening, bullying, harassment, ragging, or any form of misconduct is strictly prohibited.",
      "Students must follow instructions issued by college authorities.",
      "Students are responsible for maintaining the good reputation of the college."
    ]
  },
  {
    num: 3,
    title: "College ID Card",
    points: [
      "Students must carry their valid college identity card on campus at all times.",
      "The ID card must be produced whenever requested by faculty or college authorities.",
      "Students must not lend their ID card to another person."
    ]
  },
  {
    num: 4,
    title: "Dress and Appearance",
    points: [
      "Students are expected to maintain a neat, clean, and appropriate appearance.",
      "Students must follow any specific dress code prescribed for laboratories, workshops, examinations, or academic activities.",
      "Proper safety equipment and footwear must be used wherever required."
    ]
  },
  {
    num: 5,
    title: "Classrooms and Laboratories",
    points: [
      "Students must keep classrooms, laboratories, workshops, and other facilities clean.",
      "College equipment, furniture, computers, instruments, and property must be handled carefully.",
      "Any damage caused intentionally or through negligence may result in disciplinary action and cost recovery.",
      "Laboratory safety instructions must be followed at all times."
    ]
  },
  {
    num: 6,
    title: "Examinations",
    points: [
      "Students must follow all examination rules and instructions issued by the college.",
      "Malpractice, copying, unauthorized communication, or use of prohibited materials is strictly forbidden.",
      "Students must carry the required examination hall ticket/ID card and permitted materials.",
      "Mobile phones and unauthorized electronic devices must not be used during examinations."
    ]
  },
  {
    num: 7,
    title: "Mobile Phones and Electronic Devices",
    points: [
      "Mobile phones should be kept silent or switched off during classes, examinations, and official meetings.",
      "Students must not use electronic devices in a manner that disturbs teaching or violates campus rules.",
      "Unauthorized recording or photographing of classes, examinations, staff, or students is prohibited."
    ]
  },
  {
    num: 8,
    title: "Anti-Ragging Regulations",
    points: [
      "Ragging in any form is strictly prohibited on the college campus, hostels, transportation, and associated premises.",
      "Students must immediately report incidents of ragging to the appropriate college authorities.",
      "Violations will be dealt with according to applicable laws and strict college regulations.",
      "National Anti-Ragging Helpline: 1800-180-5522 (Toll Free)"
    ]
  },
  {
    num: 9,
    title: "Campus Cleanliness",
    points: [
      "Students must use designated dustbins and help maintain a clean campus.",
      "Littering, damaging campus property, or defacing walls and surfaces is strictly prohibited.",
      "Students should contribute to maintaining an environmentally friendly campus."
    ]
  },
  {
    num: 10,
    title: "Library Rules",
    points: [
      "Students must carry their valid ID card when using the central library.",
      "Strict silence must be maintained inside the library.",
      "Books and library materials must be returned within the prescribed period. Overdue fines apply."
    ]
  },
  {
    num: 11,
    title: "Internet and Computer Facilities",
    points: [
      "College internet and computer facilities must be used primarily for academic and legitimate purposes.",
      "Students must not access, distribute, or store illegal, offensive, or unauthorized material.",
      "Students must not attempt to damage, bypass, or compromise college computer systems or networks."
    ]
  },
  {
    num: 12,
    title: "Campus Safety",
    points: [
      "Students must follow all safety instructions issued by the college.",
      "Emergency exits, fire equipment, and safety facilities must not be misused or obstructed.",
      "Students must immediately report accidents, hazards, or suspicious activities to college authorities."
    ]
  },
  {
    num: 13,
    title: "Vehicles and Parking",
    points: [
      "Students must park vehicles only in designated student parking areas.",
      "Students must follow campus traffic speed limits and parking regulations.",
      "Reckless or dangerous driving on or around campus is prohibited."
    ]
  },
  {
    num: 14,
    title: "Prohibited Activities",
    points: [
      "Possession or use of illegal drugs, alcohol, or prohibited substances is strictly forbidden.",
      "Violence, intimidation, or harassment in any form is prohibited.",
      "Gambling or unauthorized commercial activities on campus are prohibited.",
      "Vandalism or intentional damage to college property will incur heavy penalties."
    ]
  },
  {
    num: 15,
    title: "General Responsibilities",
    points: [
      "Students must comply with official notices, circulars, and instructions issued by the college.",
      "Students should maintain high academic integrity and honesty.",
      "Ignorance of college rules will not normally be accepted as a valid excuse for violation."
    ]
  },
  {
    num: 16,
    title: "Disciplinary Action",
    points: [
      "Violation of college rules may result in appropriate disciplinary action, including formal warning, fines, loss of campus privileges, suspension, or expulsion as permitted under university regulations."
    ]
  }
];

const RulesModal = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredRules = SRKR_RULES.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.points.some((p) => p.toLowerCase().includes(search.toLowerCase()))
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                SRKR College General Rules & Regulations
              </h3>
              <p className="text-xs text-slate-500 font-medium">Official student conduct policy & campus guidelines</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save Rules PDF"
            >
              <Printer className="w-3.5 h-3.5" /> Print PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <input
              type="text"
              placeholder="Search rules (e.g. Attendance, ID Card, Examinations, Anti-Ragging)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:bg-white focus:border-red-500 outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Document Content View with SRKR Logo Header */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50/30 font-sans">
          {/* Document Header Page */}
          <div className="text-center border-b border-slate-200 pb-6 mb-6">
            <img
              src="/srkr_logo.png"
              alt="SRKR Engineering College Official Emblem"
              className="h-24 mx-auto mb-3 object-contain drop-shadow-sm"
            />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE (AUTONOMOUS)
            </h1>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-1">
              SRKR MARG, CHINAAMIRAM, BHIMAVARAM-534204, A.P.
            </p>
            <div className="inline-block mt-3 px-4 py-1 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-extrabold tracking-wider uppercase">
              GENERAL COLLEGE RULES & REGULATIONS FOR STUDENTS
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-6">
            {filteredRules.map((rule) => (
              <div
                key={rule.num}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-red-300 transition-colors space-y-2.5"
              >
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-red-100 text-red-700 flex items-center justify-center text-xs font-black">
                    {rule.num}
                  </span>
                  {rule.title}
                </h3>
                <ul className="space-y-1.5 pl-9">
                  {rule.points.map((pt, pIdx) => (
                    <li key={pIdx} className="text-xs text-slate-700 leading-relaxed list-disc">
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Anti-Ragging Banner */}
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-900">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>National Anti-Ragging Helpline: 1800-180-5522 (Toll Free 24x7)</span>
            </div>
            <span className="font-extrabold uppercase text-[10px] bg-red-200 text-red-900 px-2.5 py-1 rounded-lg">
              ZERO TOLERANCE
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center">
          <span className="text-[11px] text-slate-500 font-medium">
            SRKR Engineering College Student Code of Conduct
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
