// // src/components/dashboard/sections/CurrentlyInPanel.jsx
// // Live "who's checked in but not yet out" list.

// import { UserCheck } from "lucide-react";
// import { parseTimeToMinutes, formatMinutes, LATE_THRESHOLD_MIN } from "./utils";

// const CurrentlyInPanel = ({ whosInNow, avgCheckInMinutes }) => {
//   return (
//     <div className="dash-animate bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(15,23,42,0.06),0_1px_8px_-2px_rgba(15,23,42,0.08)] p-6">
//       <div className="flex items-center justify-between mb-1">
//         <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
//           <UserCheck size={16} className="text-green-600" />
//           Currently In
//         </h2>
//         <span className="text-xs font-medium text-slate-400 tabular-nums">
//           {whosInNow.length} on-site
//         </span>
//       </div>
//       <p className="text-xs text-slate-400 mb-4">
//         Avg check-in today: <span className="font-medium text-slate-500">{formatMinutes(avgCheckInMinutes)}</span>
//       </p>

//       {whosInNow.length === 0 ? (
//         <p className="text-sm text-slate-400 py-10 text-center">
//           No one has checked in yet.
//         </p>
//       ) : (
//         <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
//           {whosInNow.map((entry) => {
//             const late = (parseTimeToMinutes(entry.inTime) ?? -1) > LATE_THRESHOLD_MIN;
//             return (
//               <div
//                 key={entry.id}
//                 className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors"
//               >
//                 <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-700 text-white flex items-center justify-center text-xs font-semibold shrink-0 shadow-sm">
//                   {entry.name?.charAt(0)?.toUpperCase() || "?"}
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className="text-sm font-medium text-slate-800 truncate">{entry.name}</p>
//                   <p className="text-xs text-slate-400 truncate">{entry.employeeId}</p>
//                 </div>
//                 <div className="text-right shrink-0">
//                   <p className="text-xs font-medium text-slate-600 tabular-nums">{entry.inTime}</p>
//                   {late && (
//                     <span className="text-[10px] font-medium text-orange-600">Late</span>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CurrentlyInPanel;