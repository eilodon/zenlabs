import React, {useEffect, useMemo, useRef, useState} from "react";  
import Fuse from "fuse.js";  
/\*\*  
\* Linh Quang Design Kit — FINAL+ (Mobile-first, Live, Secure, Personalized)  
\* \- Component gallery \+ 3-screen flow (Home / Palette / Snackbar)  
\* \- NEW: Security cues (on‑device / hybrid / cloud), Bottom‑Sheet Palette for mobile, Feedback (👍/👎 \+ Save preset), Teach AI flow, Live ResultCard (streaming \+ shimmer \+ cancel)  
\* \- Tokens: Dynamic Type, Single‑layer glass, Haptics stub  
\* \- A11y: ≥48px, WCAG 2.2, focus trap, ARIA combobox/listbox & aria-live streaming, RTL, Dynamic Type, Reduce Motion/Transparency  
\*/  
// \---------------- Tokens \----------------  
const TOKENS \= {  
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },  
  radius: { chip: 12, card: 16 },  
  elevation: { chip: 2, card: 6 },  
  typography: { label: { size: 13, weight: 500 }, body: { size: 15, weight: 400 } },  
  typeScale: { xs: 12, s: 13, m: 15, l: 17, xl: 20 },  
  icon: { size: 20, strokeWidth: 2.25 },  
  opacity: { armed: 0.6, disabled: 0.3 },  
  duration: { in: 150, out: 200 },  
  materials: { glassLight: 'rgba(255,255,255,0.95)', glassDark: 'rgba(22,23,25,0.92)' },  
  colors: {  
    light: { surface: "\#FFFFFF", text: "\#111111", primary: "\#3B82F6", success: "\#16A34A", warn: "\#F59E0B", error: "\#DC2626" },  
    dark: { surface: "\#0B0B0C", elev: "\#161719", text: "\#EDEDED", primary: "\#3B82F6", success: "\#16A34A", warn: "\#F59E0B", error: "\#DC2626" },  
    neutral: { 500: "\#64748B", 700: "\#334155", 300: "\#CBD5E1" }  
  },  
};  
const shadow \= { chip: "0 1px 2px rgba(0,0,0,0.12), 0 1px 1px rgba(0,0,0,0.06)", card: "0 6px 18px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.12)" };  
// \---------------- Icons \----------------  
const Icon \= {  
  Search:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth}\>\<circle cx="11" cy="11" r="7"/\>\<path d="M21 21l-3.6-3.6"/\>\</svg\>),  
  Insert:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth}\>\<path d="M12 5v14M5 12h14"/\>\</svg\>),  
  Replace:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth}\>\<path d="M3 7h11v4H3z"/\>\<path d="M10 13h11v4H10z"/\>\</svg\>),  
  Copy:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth}\>\<rect x="9" y="9" width="11" height="11" rx="2"/\>\<rect x="4" y="4" width="11" height="11" rx="2"/\>\</svg\>),  
  Bulb:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth}\>\<path d="M9 18h6M10 22h4"/\>\<path d="M8 10a4 4 0 118 0c0 2-2 3-2 5H10c0-2-2-3-2-5z"/\>\</svg\>),  
  Check:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth}\>\<path d="M20 6L9 17l-5-5"/\>\</svg\>),  
  Warn:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth}\>\<path d="M12 9v4"/\>\<path d="M12 17h.01"/\>\<path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/\>\</svg\>),  
  Error:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth}\>\<circle cx="12" cy="12" r="9"/\>\<path d="M15 9l-6 6M9 9l6 6"/\>\</svg\>),  
  ThumbUp:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth}\>\<path d="M14 9V5a3 3 0 00-3-3l-4 9v8h9a3 3 0 003-3v-7a3 3 0 00-3-3h-2z"/\>\</svg\>),  
  ThumbDown:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth} transform="scale(1,-1)"\>\<path d="M14 9V5a3 3 0 00-3-3l-4 9v8h9a3 3 0 003-3v-7a3 3 0 00-3-3h-2z"/\>\</svg\>),  
  Star:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="currentColor"\>\<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/\>\</svg\>),  
  Lock:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth}\>\<rect x="4" y="10" width="16" height="10" rx="2"/\>\<path d="M8 10V7a4 4 0 118 0v3"/\>\</svg\>),  
  Dot:(p:any)=\>(\<svg {...p} viewBox="0 0 8 8" fill="currentColor"\>\<circle cx="4" cy="4" r="4"/\>\</svg\>),  
  Close:(p:any)=\>(\<svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={p.strokeWidth ?? TOKENS.icon.strokeWidth}\>\<path d="M18 6L6 18M6 6l12 12"/\>\</svg\>),  
};  
// \---------------- Theme controls \----------------  
function useThemeControls(){  
  const \[dark, setDark\] \= useState(false);  
  const \[rtl, setRtl\] \= useState(false);  
  const \[reduceMotion, setReduceMotion\] \= useState(false);  
  const \[reduceTransparency, setReduceTransparency\] \= useState(false);  
  const \[haptics, setHaptics\] \= useState(false);  
  const \[fontScale, setFontScale\] \= useState(1);  
  // Security processing mode: on-device / hybrid / cloud  
  const \[secMode, setSecMode\] \= useState\<'on-device'|'hybrid'|'cloud'\>('on-device');  
  return { dark, setDark, rtl, setRtl, reduceMotion, setReduceMotion, reduceTransparency, setReduceTransparency, haptics, setHaptics, fontScale, setFontScale, secMode, setSecMode };  
}  
// Utilities  
function useMediaQuery(q:string){  
  const \[m, setM\] \= useState(false);  
  useEffect(()=\>{ const mm \= window.matchMedia(q); const h=()=\>setM(mm.matches); h(); mm.addEventListener('change', h); return ()=\>mm.removeEventListener('change', h); },\[q\]);  
  return m;  
}  
// Long press util  
function useLongPress(callback \= ()=\>{}, ms \= 450){  
  const timerRef \= useRef\<any\>(null);  
  const start \= () \=\> { timerRef.current \= setTimeout(callback, ms); };  
  const clear \= () \=\> { if(timerRef.current){ clearTimeout(timerRef.current); timerRef.current \= null; } };  
  return { onPointerDown:start, onPointerUp:clear, onPointerLeave:clear, onPointerCancel:clear } as any;  
}  
// \----- Haptics util (web) \-----  
function haptic(kind:'success'|'warn'|'error'|'selection'='selection'){  
  try{  
    // @ts-ignore  
    if(\!(window as any).\_\_LQ\_HAPTICS) return;  
    if(\!('vibrate' in navigator)) return;  
    if(kind==='success') navigator.vibrate(10);  
    else if(kind==='warn') navigator.vibrate(\[15,30,15\]);  
    else if(kind==='error') navigator.vibrate(\[20,20,40,20\]);  
    else navigator.vibrate(5);  
  }catch{}  
}  
// \---------------- Security Cue \----------------  
function SecurityCue({mode, dark=false}:{mode:'on-device'|'hybrid'|'cloud'; dark?:boolean}){  
  const pal \= dark ? TOKENS.colors.dark : TOKENS.colors.light;  
  const map \= {  
    'on-device': { color: pal.success, label: 'On‑device' },  
    'hybrid':    { color: pal.primary, label: 'Hybrid' },  
    'cloud':     { color: TOKENS.colors.neutral\[500\], label: 'Cloud' },  
  } as const;  
  const cfg \= map\[mode\];  
  return (  
    \<div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-\[12px\]" style={{borderColor:cfg.color, color:cfg.color}} aria-label={\`Privacy: ${cfg.label}\`} title={\`Processing: ${cfg.label}\`}\>  
      \<Icon.Dot width={8} height={8} /\>  
      \<span\>{cfg.label}\</span\>  
      \<Icon.Lock width={14} height={14} /\>  
    \</div\>  
  );  
}  
// \---------------- Primitives \----------------  
function HintChip({ label, state \= "default", onClick, ariaLabel }: { label:string; state?:"default"|"armed"|"active"; onClick?:()=\>void; ariaLabel?:string; }){  
  const base \= "inline-flex items-center justify-center min-h-12 px-3 select-none rounded-\[12px\] text-\[13px\] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 motion-reduce:transition-none";  
  const theme \= { default:"bg-slate-100 text-slate-900 hover:bg-slate-200", armed:"bg-slate-100/60 text-slate-900/90 hover:bg-slate-200/70", active:"bg-blue-500 text-white hover:bg-blue-600" } as const;  
  return (  
    \<button aria-label={ariaLabel||label} onClick={onClick} className={\`${base} ${theme\[state\]} transition-colors\`} style={{boxShadow:shadow.chip}}\>  
      \<span className="mx-1" aria-hidden\>💡\</span\>{label}  
    \</button\>  
  );  
}  
function ToolbarButton({icon:IconCmp, label, disabled, onClick}:{icon:any; label:string; disabled?:boolean; onClick?:()=\>void;}){  
  return (  
    \<button onClick={onClick} disabled={disabled}  
      className={\`min-h-12 min-w-12 inline-flex items-center gap-2 rounded-\[12px\] px-3 border transition-colors motion-reduce:transition-none ${disabled?"opacity-30 cursor-not-allowed":"hover:bg-slate-100 border-slate-300"}\`}  
      aria-disabled={disabled}  
    \>  
      \<IconCmp width={TOKENS.icon.size} height={TOKENS.icon.size} aria-hidden /\>  
      \<span style={{fontSize:TOKENS.typography.label.size, fontWeight:TOKENS.typography.label.weight}}\>{label}\</span\>  
    \</button\>  
  );  
}  
function PaletteListItem({icon:IconCmp,label,desc,active,id}:{icon:any;label:string;desc:string;active?:boolean;id?:string}){  
  return (  
    \<div id={id} role="option" aria-selected={\!\!active}  
      className={\`min-h-12 rounded-\[12px\] px-3 py-2 flex items-center gap-3 border transition-colors motion-reduce:transition-none ${active?"bg-blue-50 border-blue-200":"hover:bg-slate-50 border-slate-200"}\`}  
      tabIndex={0}  
    \>  
      \<div className="shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center"\>\<IconCmp width={18} height={18} aria-hidden/\>\</div\>  
      \<div className="flex-1"\>  
        \<div className="text-\[15px\]" style={{fontWeight:TOKENS.typography.label.weight}}\>{label}\</div\>  
        \<div className="text-\[13px\] text-slate-500"\>{desc}\</div\>  
      \</div\>  
    \</div\>  
  );  
}  
// \---------------- Live Result Card (streaming) \----------------  
function ResultCard({title, content, imageSrc, imageAlt="Preview image", code, codeLang="", lines=6, generating=false, onCancel, onInsert, onReplace, onCopy, onDismiss, secMode='on-device', onFeedback, themeDark=false}:{title:string; content?:string; imageSrc?:string; imageAlt?:string; code?:string; codeLang?:string; lines?:number; generating?:boolean; onCancel?:()=\>void; onInsert:()=\>void; onReplace:()=\>void; onCopy:()=\>void; onDismiss?:()=\>void; secMode?:'on-device'|'hybrid'|'cloud'; onFeedback?:(v:'up'|'down')=\>void; themeDark?:boolean;}){  
  const \[previewOpen, setPreviewOpen\] \= useState(false);  
  const pressPreview \= useLongPress(()=\>setPreviewOpen(true), 500);  
  const sxCard \= \`rounded-\[16px\] p-4 bg-white border transition-all motion-reduce:transition-none\`;  
  const clampStyle: React.CSSProperties \= { display:"-webkit-box", WebkitLineClamp:lines as any, WebkitBoxOrient:"vertical" as any, overflow:"hidden" };  
  const baseText \= content || "Hệ thống đang tạo bản viết lại theo tông trang nhã, giữ mạch tự nhiên và loại bỏ lặp từ. Bản mới súc tích hơn, tập trung ý chính và có CTA rõ ràng.";  
  const \[stream, setStream\] \= useState("");  
  const \[isGen, setIsGen\] \= useState(generating);  
  const caret \= \<span className="inline-block w-2 h-4 align-\[-2px\] bg-slate-800 animate-pulse" aria-hidden\>\</span\>;  
  // Simulate streaming  
  useEffect(()=\>{  
    if(\!isGen) return;  
    setStream("");  
    let i \= 0; const text \= baseText \+ " ";  
    const id \= setInterval(()=\>{ setStream(s \=\> s \+ text\[i\]); i++; if(i\>=text.length){ clearInterval(id); setIsGen(false);} }, 20);  
    return ()=\>clearInterval(id);  
  },\[isGen\]);  
  // Close on Esc & Focus trap  
  const modalRef \= useRef\<HTMLDivElement|null\>(null);  
  const lastFocusedRef \= useRef\<HTMLElement|null\>(null);  
  useEffect(()=\>{ if(\!previewOpen) return; const onKey=(e:KeyboardEvent)=\>{ if(e.key==='Escape') setPreviewOpen(false); }; window.addEventListener('keydown', onKey); return ()=\>window.removeEventListener('keydown', onKey); },\[previewOpen\]);  
  useEffect(()=\>{  
    if(\!previewOpen) return;  
    const selector \= 'button, \[href\], input, select, textarea, \[tabindex\]:not(\[tabindex="-1"\])';  
    lastFocusedRef.current \= document.activeElement as HTMLElement;  
    const trap \= (e: KeyboardEvent) \=\> {  
      if(e.key \!== 'Tab') return;  
      const root \= modalRef.current; if(\!root) return;  
      const nodes \= Array.from(root.querySelectorAll(selector)) as HTMLElement\[\];  
      if(nodes.length \=== 0\) return;  
      const first \= nodes\[0\], last \= nodes\[nodes.length-1\];  
      if(e.shiftKey && document.activeElement \=== first){ e.preventDefault(); last.focus(); }  
      else if(\!e.shiftKey && document.activeElement \=== last){ e.preventDefault(); first.focus(); }  
    };  
    window.addEventListener('keydown', trap);  
    setTimeout(()=\>{ const n \= modalRef.current?.querySelector(selector) as HTMLElement|null; n?.focus(); },0);  
    return ()=\>{ window.removeEventListener('keydown', trap); lastFocusedRef.current?.focus(); };  
  },\[previewOpen\]);  
  return (  
    \<div {...pressPreview} className={\`${sxCard} group relative\`} role="region" aria-label={\`Result card: ${title}\`} style={{boxShadow:shadow.card}}\>  
      \<div className="absolute top-3 right-3 flex items-center gap-2 opacity-90"\>  
        \<SecurityCue mode={secMode} dark={themeDark}/\>  
        \<button aria-label="Dismiss" onClick={onDismiss} className="min-h-8 min-w-8 rounded-full bg-slate-100 hover:bg-slate-200 border"\>\<Icon.Close width={16} height={16}/\>\</button\>  
      \</div\>  
      \<div className="mb-2 flex items-center gap-2 text-slate-600"\>\<Icon.Bulb width={16} height={16}/\>\<span className="text-\[13px\]" style={{fontWeight:500}}\>{title}\</span\>\</div\>  
      {/\* Content area \*/}  
      \<div className="mb-4 grid gap-3"\>  
        {imageSrc && (  
          \<div className="rounded-\[12px\] overflow-hidden border bg-slate-50"\>\<img src={imageSrc} alt={imageAlt} className="w-full h-40 object-cover"/\>\</div\>  
        )}  
        {code && \!imageSrc && (  
          \<pre className="rounded-\[12px\] border bg-slate-50 p-3 overflow-auto text-\[13px\] max-h-40" aria-label="Code preview"\>\<code\>{code}\</code\>\</pre\>  
        )}  
        {\!imageSrc && \!code && (  
          \<div aria-live={isGen ? "off" : "polite"} aria-busy={isGen} className="text-\[15px\] leading-6 text-slate-700"\>  
            {isGen ? (  
              \<\>  
                \<div className="h-20 rounded-\[12px\] bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 bg-\[length:200%\_100%\] animate-\[shimmer\_1.2s\_infinite\] border mb-2" aria-hidden\>\</div\>  
                \<p\>{stream}{caret}\</p\>  
                \<style\>{\`@keyframes shimmer{0%{background-position:0% 0}100%{background-position:-200% 0}}\`}\</style\>  
                \<div className="mt-2"\>\<button onClick={()=\>{ setIsGen(false); onCancel?.(); }} className="min-h-10 rounded-\[12px\] px-3 border"\>Dừng tạo\</button\>\</div\>  
              \</\>  
            ) : (  
              \<p style={clampStyle}\>{baseText}\</p\>  
            )}  
          \</div\>  
        )}  
      \</div\>  
      {/\* Primary actions \*/}  
      \<div className="flex gap-2 flex-wrap"\>  
        \<button tabIndex={0} onClick={()=\>{ haptic('success'); onInsert(); }} className="min-h-12 rounded-\[12px\] px-4 inline-flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-2"\>\<Icon.Insert width={18} height={18}/\>\<span\>Insert\</span\>\</button\>  
        \<button tabIndex={0} onClick={()=\>{ haptic('success'); onReplace(); }} className="min-h-12 rounded-\[12px\] px-4 inline-flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-700 focus-visible:ring-2"\>\<Icon.Replace width={18} height={18}/\>\<span\>Replace\</span\>\</button\>  
        \<button tabIndex={0} onClick={()=\>{ haptic('selection'); onCopy(); }} className="min-h-12 rounded-\[12px\] px-4 inline-flex items-center gap-2 border hover:bg-slate-50"\>\<Icon.Copy width={18} height={18}/\>\<span\>Copy\</span\>\</button\>  
        \<button tabIndex={0} onClick={()=\>setPreviewOpen(true)} className="min-h-12 rounded-\[12px\] px-4 inline-flex items-center gap-2 border hover:bg-slate-50"\>Preview\</button\>  
      \</div\>  
      {/\* Feedback row \*/}  
      \<div className="mt-2 flex items-center gap-2 text-slate-500"\>  
        \<span className="text-\[12px\]"\>Phản hồi:\</span\>  
        \<button onClick={()=\>{ haptic('selection'); onFeedback?.('up'); }} className="min-h-10 rounded-\[12px\] px-2 border hover:bg-slate-50" aria-label="Hữu ích"\>\<Icon.ThumbUp width={16} height={16}/\>\</button\>  
        \<button onClick={()=\>{ haptic('selection'); onFeedback?.('down'); }} className="min-h-10 rounded-\[12px\] px-2 border hover:bg-slate-50" aria-label="Không hữu ích"\>\<Icon.ThumbDown width={16} height={16}/\>\</button\>  
        \<button onClick={()=\>{ haptic('success'); alert('Đã lưu preset làm mặc định.'); }} className="min-h-10 rounded-\[12px\] px-2 border hover:bg-slate-50 inline-flex items-center gap-1" aria-label="Lưu preset"\>\<Icon.Star width={14} height={14}/\>\<span className="text-\[12px\]"\>Lưu preset\</span\>\</button\>  
      \</div\>  
      {/\* Preview modal \*/}  
      {previewOpen && (  
        \<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Preview"\>  
          \<div ref={modalRef} className="max-w-3xl w-full rounded-\[16px\] border bg-white p-5" style={{boxShadow:shadow.card}} tabIndex={-1}\>  
            \<div className="mb-3 flex items-center justify-between"\>\<div className="font-medium"\>{title}\</div\>\<button className="min-h-10 px-3 rounded-\[12px\] border" onClick={()=\>setPreviewOpen(false)}\>Đóng\</button\>\</div\>  
            {imageSrc ? (  
              \<img src={imageSrc} alt="Preview large" className="w-full h-auto rounded-\[12px\]"/\>  
            ) : code ? (  
              \<pre className="rounded-\[12px\] border bg-slate-50 p-4 overflow-auto text-\[13px\]"\>\<code className={\`language-${codeLang}\`}\>{code}\</code\>\</pre\>  
            ) : (  
              \<p className="text-\[15px\] leading-7 text-slate-800"\>{isGen? stream : baseText}\</p\>  
            )}  
          \</div\>  
        \</div\>  
      )}  
    \</div\>  
  );  
}  
// \---------------- Snackbar (custom easing per kind) \----------------  
function Snackbar({kind="success", text, onUndo, onClose}:{kind?:"success"|"warn"|"error"; text:string; onUndo?:()=\>void; onClose?:()=\>void;}){  
  const \[closing, setClosing\] \= useState(false);  
  const easingIn \= kind==="success"? "cubic-bezier(0.22,1,0.36,1)" : kind==="warn"? "cubic-bezier(0.4,0,0.2,1)" : "cubic-bezier(0.4,0,1,1)";  
  const easingOut \= easingIn;  
  useEffect(()=\>{  
    const SHOW \= 3500; // ≥ 3.5s  
    const t1 \= setTimeout(()=\> setClosing(true), Math.max(0, SHOW \- TOKENS.duration.out));  
    const t2 \= setTimeout(()=\> onClose?.(), SHOW);  
    return ()=\>{ clearTimeout(t1); clearTimeout(t2); };  
  },\[onClose\]);  
  return (  
    \<div role="status" aria-live="polite" aria-atomic="true"  
      className={\`fixed left-1/2 \-translate-x-1/2 bottom-6 z-50 min-w-\[280px\] max-w-\[92vw\] rounded-\[12px\] px-4 py-3 border shadow-lg flex items-center justify-between gap-3 ${closing?"animate-snack-out":"animate-snack-in"} motion-reduce:animate-none\`}  
      style={{background:'var(--glass-bg)', \['--ease-in' as any\]:easingIn, \['--ease-out' as any\]:easingOut, \['--dur-in' as any\]:\`${TOKENS.duration.in}ms\`, \['--dur-out' as any\]:\`${TOKENS.duration.out}ms\`}}\>  
      \<style\>{\`  
@keyframes snackIn{from{opacity:0; transform:translate(-50%,12px)} to{opacity:1; transform:translate(-50%,0)}}  
@keyframes snackOut{from{opacity:1; transform:translate(-50%,0)} to{opacity:0; transform:translate(-50%,8px)}}  
.animate-snack-in{animation: snackIn var(--dur-in) var(--ease-in)}  
.animate-snack-out{animation: snackOut var(--dur-out) var(--ease-out) forwards}  
\`}\</style\>  
      \<div className={\`flex items-center gap-2 text-slate-800 ${kind==="success"?"border-green-600":kind==="warn"?"border-amber-600":"border-red-600"}\`}\>  
        {kind==="success"? \<Icon.Check width={18} height={18}/\> : kind==="warn"? \<Icon.Warn width={18} height={18}/\> : \<Icon.Error width={18} height={18}/\>}  
        \<span className="text-\[15px\]"\>{text}\</span\>  
      \</div\>  
      {onUndo && \<button onClick={onUndo} className="underline font-medium" tabIndex={0}\>Undo\</button\>}  
    \</div\>  
  );  
}  
// \---------------- Bottom Sheet (mobile Palette) \----------------  
function BottomSheet({open, onClose, children}:{open:boolean; onClose:()=\>void; children:any}){  
  const \[dy, setDy\] \= useState(0);  
  const startY \= useRef\<number|null\>(null);  
  useEffect(() \=\> {  
    if (\!open) return;  
    const onKey \= (e: KeyboardEvent) \=\> { if (e.key \=== 'Escape') onClose(); };  
    window.addEventListener('keydown', onKey);  
    return () \=\> window.removeEventListener('keydown', onKey);  
  }, \[open, onClose\]);  
  if(\!open) return null;  
  return (  
    \<div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Palette"\>  
      \<div className="absolute inset-0 bg-black/40" onClick={onClose}\>\</div\>  
      \<div className="absolute left-0 right-0 bottom-0 rounded-t-\[16px\] bg-white border-t shadow-xl"  
        style={{transform:\`translateY(${Math.max(0, dy)}px)\`}}  
        onTouchStart={(e)=\>{ startY.current \= e.touches\[0\].clientY; }}  
        onTouchMove={(e)=\>{ if(startY.current==null) return; setDy(Math.max(0, e.touches\[0\].clientY \- startY.current)); }}  
        onTouchEnd={()=\>{ if(dy\>80) onClose(); setDy(0); }}\>  
        \<div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-3"/\>  
        \<div className="max-h-\[70vh\] overflow-auto p-3"\>{children}\</div\>  
      \</div\>  
    \</div\>  
  );  
}  
// \---------------- Component Gallery \----------------  
function ComponentGallery(){  
  const \[snack, setSnack\] \= useState\<any\>(null);  
  const imageDemo \= "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80\&w=1200\&auto=format\&fit=crop";  
  const codeDemo \= \`function greet(name){  
return \\\`Hello, ${'${'}name{'}'}\!\\\`;  
}  
console.log(greet('World'));\`;  
  return (  
    \<div className="space-y-8"\>  
      \<section\>  
        \<h3 className="text-xl font-semibold mb-3"\>Design Tokens\</h3\>  
        \<pre className="p-4 rounded-\[16px\] bg-slate-50 overflow-auto text-\[13px\]"\>{JSON.stringify(TOKENS, null, 2)}\</pre\>  
      \</section\>  
      \<section\>  
        \<h3 className="text-xl font-semibold mb-3"\>Components — Light & Dark\</h3\>  
        \<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"\>  
          {/\* Light \*/}  
          \<div className="rounded-\[16px\] p-5 border bg-white"\>  
            \<h4 className="font-medium mb-4"\>Light\</h4\>  
            \<div className="flex gap-2 flex-wrap mb-3"\>  
              \<HintChip label="Gợi ý" state="default"/\>  
              \<HintChip label="Sẵn sàng" state="armed"/\>  
              \<HintChip label="Đang hoạt động" state="active"/\>  
            \</div\>  
            \<div className="flex gap-2 mb-4 flex-wrap"\>  
              \<ToolbarButton icon={Icon.Bulb} label="Rewrite"/\>  
              \<ToolbarButton icon={Icon.Search} label="Search"/\>  
              \<ToolbarButton icon={Icon.Copy} label="Copy" disabled/\>  
            \</div\>  
            \<div className="grid gap-4"\>  
              \<PaletteListItem icon={Icon.Bulb} label="Viết lại lịch sự" desc="Tông trang nhã, ngắn gọn"/\>  
              \<ResultCard title="Live Card (Generating)" generating secMode='on-device'  
                onCancel={()=\>{}}  
                onInsert={()=\>setSnack({kind:"success", text:"Inserted. Undo?"})}  
                onReplace={()=\>setSnack({kind:"success", text:"Replaced. Undo?"})}  
                onCopy={()=\>setSnack({kind:"success", text:"Copied."})} onDismiss={()=\>{}} onFeedback={()=\>{}} /\>  
              \<ResultCard title="Card với code" codeLang="js" code={codeDemo} secMode='cloud'  
                onInsert={()=\>setSnack({kind:"success", text:"Inserted. Undo?"})}  
                onReplace={()=\>setSnack({kind:"success", text:"Replaced. Undo?"})}  
                onCopy={()=\>setSnack({kind:"success", text:"Copied."})} onDismiss={()=\>{}} onFeedback={()=\>{}} /\>  
            \</div\>  
          \</div\>  
          {/\* Dark \*/}  
          \<div className="rounded-\[16px\] p-5 border" style={{background:TOKENS.colors.dark.surface, color:TOKENS.colors.dark.text}}\>  
            \<h4 className="font-medium mb-4"\>Dark\</h4\>  
            \<div className="flex gap-2 flex-wrap mb-3"\>  
              \<HintChip label="Gợi ý" state="default"/\>  
              \<HintChip label="Sẵn sàng" state="armed"/\>  
              \<HintChip label="Đang hoạt động" state="active"/\>  
            \</div\>  
            \<div className="flex gap-2 mb-4 flex-wrap"\>  
              \<ToolbarButton icon={Icon.Bulb} label="Rewrite"/\>  
              \<ToolbarButton icon={Icon.Search} label="Search"/\>  
              \<ToolbarButton icon={Icon.Copy} label="Copy" disabled/\>  
            \</div\>  
            \<div className="grid gap-4 opacity-90"\>  
              \<PaletteListItem icon={Icon.Bulb} label="Dịch sang Anh" desc="Bản dịch tự nhiên"/\>  
              \<ResultCard title="Card với hình (Dark)" imageSrc={imageDemo} secMode='hybrid' themeDark  
                onInsert={()=\>setSnack({kind:"success", text:"Inserted. Undo?"})}  
                onReplace={()=\>setSnack({kind:"success", text:"Replaced. Undo?"})}  
                onCopy={()=\>setSnack({kind:"success", text:"Copied."})} onDismiss={()=\>{}} onFeedback={()=\>{}} /\>  
            \</div\>  
          \</div\>  
        \</div\>  
      \</section\>  
      {snack && \<Snackbar kind={snack.kind} text={snack.text} onUndo={()=\>setSnack(null)} onClose={()=\>setSnack(null)} /\>}  
    \</div\>  
  );  
}  
// \---------------- Dismissible wrapper (state \+ class) \----------------  
function Dismissible({children}:{children:any}){  
  const \[dx,setDx\] \= useState(0);  
  const \[downX,setDownX\] \= useState\<number|null\>(null);  
  const \[dismissed, setDismissed\] \= useState(false);  
  if(dismissed) return null;  
  return (  
    \<div  
      tabIndex={0}  
      aria-label="Swipe left hoặc nhấn Delete để bỏ"  
      onKeyDown={(e)=\>{ if(\['Backspace','Delete','Escape'\].includes(e.key)){ setDismissed(true); } }}  
      className={\`transition-transform ${dx\!==0?"" : "duration-200"}\`}  
      style={{transform:\`translateX(${dx}px)\`, opacity: dx\<-40?0.6:1}}  
      onPointerDown={(e)=\>setDownX(e.clientX)}  
      onPointerMove={(e)=\>{ if(downX===null) return; const delta \= (e.clientX \- downX); if(delta\<0) setDx(delta); }}  
      onPointerUp={()=\>{ if(dx\<-56) setDismissed(true); setDx(0); setDownX(null); }}  
      onPointerCancel={()=\>{ setDx(0); setDownX(null); }}  
      onTouchStart={(e)=\>setDownX(e.touches\[0\].clientX)}  
      onTouchMove={(e)=\>{ if(downX===null) return; const delta=(e.touches\[0\].clientX-downX); if(delta\<0) setDx(delta);} }  
      onTouchEnd={()=\>{ if(dx\<-56) setDismissed(true); setDx(0); setDownX(null); }}  
    \>{children}\</div\>  
  );  
}  
// \---------------- Teach AI Modal \----------------  
function TeachAIModal({open,onClose}:{open:boolean; onClose:()=\>void}){  
  const ref \= useRef\<HTMLDivElement|null\>(null);  
  const \[abbr,setAbbr\] \= useState("");  
  const \[expand,setExpand\] \= useState("");  
  const \[note,setNote\] \= useState("");  
  if(\!open) return null;  
  return (  
    \<div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Teach AI"\>  
      \<div ref={ref} className="max-w-xl w-full rounded-\[16px\] border bg-white p-5" style={{boxShadow:shadow.card}}\>  
        \<div className="mb-3 flex items-center justify-between"\>\<div className="font-medium"\>Dạy AI (từ viết tắt / quy tắc)\</div\>\<button onClick={onClose} className="min-h-10 px-3 rounded-\[12px\] border"\>Đóng\</button\>\</div\>  
        \<div className="grid gap-3"\>  
          \<label className="grid gap-1 text-\[13px\]"\>\<span\>Từ viết tắt\</span\>\<input value={abbr} onChange={e=\>setAbbr(e.target.value)} className="border rounded-\[12px\] px-3 min-h-12" placeholder="VD: ETA"/\>\</label\>  
          \<label className="grid gap-1 text-\[13px\]"\>\<span\>Mở rộng thành\</span\>\<input value={expand} onChange={e=\>setExpand(e.target.value)} className="border rounded-\[12px\] px-3 min-h-12" placeholder="VD: Estimated Time of Arrival"/\>\</label\>  
          \<label className="grid gap-1 text-\[13px\]"\>\<span\>Ghi chú (tuỳ chọn)\</span\>\<textarea value={note} onChange={e=\>setNote(e.target.value)} className="border rounded-\[12px\] px-3 py-2 min-h-24"/\>\</label\>  
          \<div className="text-right"\>\<button onClick={()=\>{ alert('Đã lưu quy tắc cá nhân hoá.'); onClose(); }} className="min-h-12 px-4 rounded-\[12px\] bg-blue-600 text-white"\>Lưu\</button\>\</div\>  
        \</div\>  
      \</div\>  
    \</div\>  
  );  
}  
// \---------------- App Flow (3 screens) \----------------  
function AppFlow(){  
  const \[screen, setScreen\] \= useState(0); // 0 Home, 1 Palette, 2 Snackbar  
  const \[snack, setSnack\] \= useState\<any\>(null);  
  const \[sensitive, setSensitive\] \= useState(false);  
  const \[teachOpen, setTeachOpen\] \= useState(false);  
  const isMobile \= useMediaQuery('(max-width: 768px)');  
  // Data \+ Fuse search with debounce & loading  
  const COMMANDS \= useMemo(()=\>\[  
    {icon: Icon.Bulb, label: "Viết lại lịch sự", desc: "Tông trang nhã, ngắn gọn"},  
    {icon: Icon.Bulb, label: "Dịch sang tiếng Anh", desc: "Bản dịch tự nhiên"},  
    {icon: Icon.Bulb, label: "Tóm tắt 3 câu", desc: "Giữ ý chính"},  
    {icon: Icon.Bulb, label: "Tối ưu tiêu đề", desc: "Rõ ràng, súc tích"},  
    {icon: Icon.Bulb, label: "Chuẩn hoá giọng", desc: "Thân thiện, chuyên nghiệp"},  
  \],\[\]);  
  const fuse \= useMemo(()=\> new Fuse(COMMANDS, {keys:\["label","desc"\], includeScore:true, threshold:0.35, ignoreLocation:true}), \[COMMANDS\]);  
  const \[q,setQ\] \= useState("");  
  const \[dq,setDQ\] \= useState("");  
  const \[loading, setLoading\] \= useState(false);  
  const \[activeIdx, setActiveIdx\] \= useState(0);  
  useEffect(()=\>{ setLoading(true); const t=setTimeout(()=\>{ setDQ(q.trim()); setLoading(false); }, 220); return ()=\>{ clearTimeout(t); setLoading(false); }; },\[q\]);  
  const palResults \= useMemo(()=\> dq? fuse.search(dq).map(r=\>r.item) : COMMANDS, \[dq, fuse, COMMANDS\]);  
  useEffect(()=\>{ setActiveIdx(0); }, \[dq\]);  
  useEffect(()=\>{ const handler \= (e: KeyboardEvent)=\>{ if((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); setScreen(1); } }; window.addEventListener('keydown', handler); return ()=\>window.removeEventListener('keydown', handler); },\[\]);  
  const Toolbar \= (  
    \<div className="sticky top-0 backdrop-blur glass border-b z-10" style={{background:'var(--glass-bg)'}}\>  
      \<div className="flex items-center gap-2 py-2 px-1"\>  
        \<ToolbarButton icon={Icon.Bulb} label="Rewrite"/\>  
        \<ToolbarButton icon={Icon.Search} label="Search"/\>  
        \<ToolbarButton icon={Icon.Copy} label="Copy"/\>  
        \<div className="ml-auto flex items-center gap-3"\>  
          \<label className="inline-flex items-center gap-2 text-\[13px\]"\>\<input type="checkbox" onChange={e=\>setSensitive(e.target.checked)} /\> Sensitive field\</label\>  
          \<button onClick={()=\>setTeachOpen(true)} className="min-h-12 rounded-\[12px\] px-3 border\[43dcd9a7-70db-4a1f-b0ae-981daa162054\](https://github.com/bluewave41/Assessment/tree/c6a7652345807c38f184641d73ebbe75141ae6ae/Networx%20Assessment%2FClientApp%2Fsrc%2Fcomponents%2FFavouriteIcon.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "1")\[43dcd9a7-70db-4a1f-b0ae-981daa162054\](https://github.com/GallupinGallup/Survey-site-Trial-1/tree/d425bf05d13e5e8938ec6d74ff3430eb8db11679/surveys%2F2017%2Fwebsite%2Fsrc%2Fcomponents%2Felements%2FLibraries.js?citationMarker=43dcd9a7-70db-4a1f-b0ae-981daa162054 "2")