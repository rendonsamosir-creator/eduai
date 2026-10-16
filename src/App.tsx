import { createContext, useContext, useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";

type Role = "Siswa" | "Pengawas" | "Penyelenggara Ujian" | "Admin" | "Pihak Sekolah";
type CreatedExam = { name: string; description: string; date: string; start: string; duration: string; supervisor: string; status: string; students: string[] };

type Screen =
  | "landing"
  | "login"
  | "dashboard"
  | "sessions"
  | "create"
  | "exam-detail"
  | "waiting"
  | "consent"
  | "device"
  | "exam"
  | "monitor"
  | "student-detail"
  | "detail"
  | "timeline"
  | "report"
  | "indications"
  | "history"
  | "my-exams"
  | "users"
  | "configuration"
  | "retention"
  | "audit"
  | "access-denied"
  | "students"
  | "settings";

const RoleContext = createContext<{ role: Role; setRole: (role: Role) => void }>({ role: "Pengawas", setRole: () => undefined });
const useRole = () => useContext(RoleContext);
const ExamContext = createContext<{ createdExam: CreatedExam | null; setCreatedExam: (exam: CreatedExam) => void }>({ createdExam: null, setCreatedExam: () => undefined });
const useExam = () => useContext(ExamContext);

type IconName =
  | "grid"
  | "monitor"
  | "report"
  | "settings"
  | "search"
  | "plus"
  | "upload"
  | "calendar"
  | "clock"
  | "users"
  | "camera"
  | "mic"
  | "wifi"
  | "bell"
  | "chevron"
  | "arrow"
  | "check"
  | "video"
  | "download"
  | "more"
  | "menu"
  | "close"
  | "shield"
  | "file";

const notify = (message: string) => window.dispatchEvent(new CustomEvent("eduai-toast", { detail: message }));

function Toaster() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    let timer = 0;
    const show = (e: Event) => { setMessage((e as CustomEvent<string>).detail); window.clearTimeout(timer); timer = window.setTimeout(() => setMessage(""), 3000); };
    window.addEventListener("eduai-toast", show);
    return () => window.removeEventListener("eduai-toast", show);
  }, []);
  return message ? <div role="status" className="fixed bottom-6 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 rounded-md bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg">{message}</div> : null;
}

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label?: string }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={onChange} className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-blue-700" : "bg-slate-300"}`}><span className={`absolute top-1 size-4 rounded-full bg-white transition-all ${on ? "left-6" : "left-1"}`} /></button>;
}

// Pencarian dan filter "Semua ..." berlaku di semua tabel tanpa mengubah tiap halaman.
function useTableFilter() {
  useEffect(() => {
    const apply = (el: Element) => {
      let root: Element | null = el;
      while (root && !root.querySelector("tbody")) root = root.parentElement;
      if (!root) return;
      const q = Array.from(root.querySelectorAll<HTMLInputElement>('input[placeholder^="Cari"]')).map((i) => i.value.toLowerCase().trim()).join(" ").trim();
      const picks = Array.from(root.querySelectorAll<HTMLSelectElement>("select")).filter((x) => x.options[0]?.text.startsWith("Semua") && x.selectedIndex > 0).map((x) => x.options[x.selectedIndex].text.toLowerCase());
      root.querySelectorAll("tbody tr").forEach((tr) => { const t = (tr.textContent ?? "").toLowerCase(); (tr as HTMLElement).hidden = !(t.includes(q) && picks.every((x) => t.includes(x))); });
    };
    const h = (e: Event) => { const t = e.target as HTMLElement; if (t.matches('input[placeholder^="Cari"], select')) apply(t); };
    document.addEventListener("input", h); document.addEventListener("change", h);
    return () => { document.removeEventListener("input", h); document.removeEventListener("change", h); };
  }, []);
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    monitor: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
    report: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1-1.55V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.55 1H21v4h-.08A1.7 1.7 0 0 0 19.4 15z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    upload: <><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    camera: <><path d="M15 10l4.5-2.5v9L15 14z" /><rect x="2" y="6" width="13" height="12" rx="2" /></>,
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" /></>,
    wifi: <><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="20" r="1" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    arrow: <path d="m15 18-6-6 6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    video: <><rect x="3" y="5" width="14" height="14" rx="2" /><path d="m17 10 4-2v8l-4-2" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M4 21h16" /></>,
    more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Logo({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid size-9 place-items-center rounded-lg bg-blue-700 text-[17px] font-semibold text-white">E<span className={`absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-amber-400 ring-2 ${dark ? "ring-[#16213a]" : "ring-white"}`} /></div>
      {!compact && <div className="leading-tight"><div className={`text-lg font-semibold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>EduAI</div><div className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-500"}`}>Pengawasan Ujian</div></div>}
    </div>
  );
}

function Button({ children, variant = "primary", icon, disabled, onClick, className = "", type = "button" }: { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "success"; icon?: IconName; disabled?: boolean; onClick?: (e: MouseEvent<HTMLButtonElement>) => void; className?: string; type?: "button" | "submit" }) {
  const styles = { primary: "bg-blue-700 text-white hover:bg-blue-800", secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50", ghost: "text-slate-600 hover:bg-slate-100", success: "bg-emerald-600 text-white hover:bg-emerald-700" };
  return <button type={type} disabled={disabled} onClick={onClick ?? (type === "submit" ? undefined : () => notify(typeof children === "string" && /rekaman/i.test(children) ? "Rekaman penuh tersedia setelah OpenVidu tersambung." : `${typeof children === "string" ? children : "Aksi ini"}: tersedia setelah backend terhubung.`))} className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none ${styles[variant]} ${className}`}>{icon && <Icon name={icon} size={18} />}{children}</button>;
}

function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "blue" | "green" | "amber" | "gray" }) {
  const styles = { blue: "bg-blue-50 text-blue-700 ring-blue-100", green: "bg-emerald-50 text-emerald-700 ring-emerald-100", amber: "bg-amber-50 text-amber-700 ring-amber-100", gray: "bg-slate-100 text-slate-600 ring-slate-200" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[tone]}`}>{children}</span>;
}

function Field({ label, placeholder, type = "text", value, name }: { label: string; placeholder?: string; type?: string; value?: string; name?: string }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span><input name={name} type={type} defaultValue={label === "Peran" ? value : (label && localStorage.getItem("eduai_f_" + label)) || value} readOnly={label === "Peran"} data-k={label === "Peran" ? undefined : label} placeholder={placeholder} className="h-11 w-full rounded-md border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label>;
}

const sessions = [
  { name: "Ujian Akhir Matematika XII", date: "24 Mei 2025", time: "08.00", duration: "120 menit", students: 32, status: "Berlangsung" },
  { name: "Evaluasi Bahasa Indonesia XI", date: "26 Mei 2025", time: "09.30", duration: "90 menit", students: 28, status: "Belum mulai" },
  { name: "Ujian Tengah Semester Fisika", date: "21 Mei 2025", time: "10.00", duration: "100 menit", students: 30, status: "Selesai" },
  { name: "Asesmen Sejarah Indonesia X", date: "20 Mei 2025", time: "13.00", duration: "75 menit", students: 34, status: "Selesai" },
];

const students = [
  { name: "Alya Putri", initials: "AP", status: "Hadir", count: 0, color: "bg-slate-200" },
  { name: "Bima Pratama", initials: "BP", status: "Hadir", count: 2, color: "bg-amber-100" },
  { name: "Citra Lestari", initials: "CL", status: "Mikrofon mati", count: 1, color: "bg-slate-200" },
  { name: "Dimas Saputra", initials: "DS", status: "Hadir", count: 0, color: "bg-slate-200" },
  { name: "Farah Nabila", initials: "FN", status: "Kamera mati", count: 3, color: "bg-slate-300" },
  { name: "Gilang Ramadhan", initials: "GR", status: "Hadir", count: 1, color: "bg-slate-200" },
  { name: "Hana Maharani", initials: "HM", status: "Terputus", count: 0, color: "bg-slate-300" },
  { name: "Muhammad Iqbal Pradana Putra", initials: "IM", status: "Hadir", count: 0, color: "bg-slate-200" },
  { name: "Keisha Ananda", initials: "KA", status: "Hadir", count: 1, color: "bg-slate-200" },
];

const indications = [
  { name: "Farah Nabila", type: "Wajah tidak terdeteksi", time: "09.42.18", confidence: "Tinggi" },
  { name: "Bima Pratama", type: "Menoleh berulang kali", time: "09.39.04", confidence: "Sedang" },
  { name: "Gilang Ramadhan", type: "Suara lain terdeteksi", time: "09.36.51", confidence: "Sedang" },
  { name: "Citra Lestari", type: "Perangkat lain terlihat", time: "09.31.22", confidence: "Rendah" },
];

function Landing({ go }: { go: (s: Screen) => void }) {
  const steps: [string, string][] = [["Sebelum ujian", "Sesi dan peserta dibuat. Siswa membaca pemberitahuan, menyetujui perekaman, lalu mengecek kamera dan mikrofon."], ["Selama ujian", "Siswa mengerjakan ujian di ruang online. Sistem mencatat koneksi dan menandai momen yang perlu dicek."], ["Setelah ujian", "Pengawas meninjau bukti, memberi label valid atau tidak valid, lalu menyusun laporan sesi."]];
  const points: [string, string][] = [["AI hanya memberi indikasi", "Sistem tidak menjatuhkan sanksi. Setiap indikasi harus ditinjau pengawas sebelum masuk laporan."], ["Bukti bisa diperiksa ulang", "Setiap indikasi dilengkapi klip atau tangkapan layar beserta waktu kejadiannya."], ["Data siswa dijaga", "Persetujuan dicatat, akses mengikuti peran, dan rekaman dihapus setelah masa simpan berakhir."]];
  return <div className="min-h-screen bg-white text-slate-900">
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"><Logo /><nav className="flex items-center gap-6 text-sm font-medium text-slate-600"><a href="#cara-kerja" className="hidden hover:text-slate-900 sm:block">Cara kerja</a><a href="#prinsip" className="hidden hover:text-slate-900 sm:block">Prinsip</a><Button onClick={() => go("login")}>Masuk</Button></nav></div></header>
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
      <div><p className="text-sm font-medium text-blue-700">Sistem pendukung pengawasan ujian online</p><h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Membantu pengawas melihat lebih teliti, tanpa menggantikan penilaiannya.</h1><p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">EduAI menandai momen yang perlu dicek selama ujian online. Pengawas meninjau buktinya dan memutuskan sendiri.</p><div className="mt-8 flex flex-wrap gap-3"><Button onClick={() => go("login")}>Masuk ke EduAI</Button><a href="#cara-kerja" className="inline-flex h-10 items-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Lihat cara kerja</a></div></div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between text-xs"><p className="font-semibold text-slate-800">Ujian Akhir Matematika XI</p><span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">Berlangsung</span></div><div className="grid grid-cols-2 gap-2">{[["Alya P.", "bg-blue-100"], ["Bima P.", "bg-slate-200"], ["Citra L.", "bg-amber-100"], ["Dimas S.", "bg-slate-200"]].map(([n, c], i) => <div key={n} className={`relative aspect-video overflow-hidden rounded-md ${c} ${i === 2 ? "ring-2 ring-amber-500" : ""}`}><Silhouette /><span className="absolute bottom-1.5 left-1.5 rounded bg-slate-900/60 px-1.5 py-0.5 text-[10px] text-white">{n}</span></div>)}</div><p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">Citra Lestari · wajah tidak terlihat 12 detik · menunggu tinjauan</p></div>
    </section>
    <section id="cara-kerja" className="border-y border-slate-200 bg-slate-50 py-16"><div className="mx-auto max-w-6xl px-5"><h2 className="text-2xl font-semibold">Alur dalam tiga tahap</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{steps.map(([t, d], i) => <div key={t} className="rounded-lg border border-slate-200 bg-white p-6"><span className="text-sm font-semibold text-blue-700">Tahap {i + 1}</span><h3 className="mt-2 text-lg font-semibold">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{d}</p></div>)}</div></div></section>
    <section id="prinsip" className="mx-auto max-w-6xl px-5 py-16"><h2 className="text-2xl font-semibold">Prinsip penggunaan</h2><div className="mt-8 grid gap-8 md:grid-cols-3">{points.map(([t, d]) => <div key={t} className="border-t-2 border-blue-700 pt-4"><h3 className="font-semibold">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{d}</p></div>)}</div></section>
    <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">EduAI · Proyek Capstone</footer>
  </div>;
}

type Account = { email: string; name: string; password: string; role: Role };
const PREFIX_ROLE: Record<string, Role> = { siswa: "Siswa", pengawas: "Pengawas", penyelenggara: "Penyelenggara Ujian", admin: "Admin" };
const roleFromEmail = (email: string): Role | undefined => PREFIX_ROLE[email.toLowerCase().match(/^([a-z]+)\d*@[^\s@]+\.[^\s@]+$/)?.[1] ?? ""];
function loadAccounts(): Account[] {
  try { const raw = localStorage.getItem("eduai_accounts"); if (raw) return (JSON.parse(raw) as Account[]).filter((a) => a.role !== "Pihak Sekolah"); } catch { /* pakai akun awal */ }
  const seed: Account[] = [
    { email: "siswa1@gmail.com", name: "Alya Putri", password: "123456", role: "Siswa" },
    { email: "pengawas1@gmail.com", name: "Rina Setiawati", password: "123456", role: "Pengawas" },
    { email: "penyelenggara1@gmail.com", name: "Dedi Kurniawan", password: "123456", role: "Penyelenggara Ujian" },
    { email: "admin1@gmail.com", name: "Nadia Aulia", password: "123456", role: "Admin" },
  ];
  try { localStorage.setItem("eduai_accounts", JSON.stringify(seed)); } catch { /* abaikan */ }
  return seed;
}

function Login({ go, enter }: { go: (s: Screen) => void; enter: (r: Role) => void }) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const field = "h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100";
  const tiles = [["Alya P.", "bg-blue-100"], ["Bima P.", "bg-slate-200"], ["Citra L.", "bg-amber-100", true], ["Dimas S.", "bg-slate-200"], ["Farah N.", "bg-blue-100"], ["Gilang R.", "bg-slate-200"]] as [string, string, boolean?][];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const mail = email.trim().toLowerCase();
    const accounts = loadAccounts();
    if (register) {
      const role = roleFromEmail(mail);
      if (!role) return setError("Email harus diawali siswa, pengawas, penyelenggara, atau admin. Contoh: pengawas2@gmail.com");
      if (password.length < 6) return setError("Kata sandi minimal 6 karakter.");
      if (accounts.some((a) => a.email === mail)) return setError("Email ini sudah terdaftar.");
      try { localStorage.setItem("eduai_accounts", JSON.stringify([...accounts, { email: mail, name: name.trim() || mail.split("@")[0], password, role }])); } catch { /* abaikan */ }
      enter(role); return;
    }
    const acc = accounts.find((a) => a.email === mail && a.password === password);
    if (!acc) return setError("Email atau kata sandi salah.");
    enter(acc.role);
  };
  const switchMode = () => { setRegister(!register); setError(""); };

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.1fr_.9fr]">
      <section className="hidden flex-col justify-between border-r border-slate-200 bg-slate-50 p-14 lg:flex">
        <Logo />
        <div>
          <h1 className="max-w-md text-4xl font-semibold leading-tight text-slate-900">Pengawasan ujian online yang lebih teliti, keputusan tetap di tangan pengawas.</h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-600">EduAI menandai momen yang perlu dicek, lalu pengawas meninjau buktinya dan memutuskan sendiri.</p>
          <div className="mt-10 w-full max-w-lg rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between text-xs">
              <div><p className="font-semibold text-slate-800">Ujian Akhir Matematika XI</p><p className="text-slate-500">XI IPA 2 · 31 dari 32 siswa hadir</p></div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">Berlangsung</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {tiles.map(([nama, warna, tandai]) => (
                <div key={nama} className={`relative aspect-[4/3] overflow-hidden rounded-md ${warna} ${tandai ? "ring-2 ring-amber-500" : ""}`}>
                  <svg viewBox="0 0 40 40" aria-hidden="true" className="absolute bottom-0 left-1/2 h-4/5 -translate-x-1/2 text-white/70"><circle cx="20" cy="15" r="7" fill="currentColor" /><path d="M6 40c0-9 6-14 14-14s14 5 14 14z" fill="currentColor" /></svg>
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-slate-900/60 px-1.5 py-0.5 text-[10px] text-white">{nama}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <span>Citra Lestari · wajah tidak terlihat 12 detik</span>
              <span className="font-semibold">Tinjau</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-500">SMA Negeri 8 Bandung</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-sm">
          <button type="button" onClick={() => go("landing")} className="mb-8 text-sm font-medium text-slate-500 hover:text-slate-900">&larr; Kembali ke beranda</button>
          <div className="mb-10 lg:hidden"><Logo /></div>
          <h2 className="text-2xl font-semibold text-slate-900">{register ? "Buat akun EduAI" : "Masuk ke EduAI"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{register ? "Peran ditentukan dari awalan email, misalnya pengawas2@gmail.com." : "Gunakan email yang sudah didaftarkan sekolah."}</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {register && <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Nama lengkap</span><input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Nama sesuai data sekolah" /></label>}
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className={field} placeholder="pengawas1@gmail.com" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">Kata sandi</span>
              <div className="relative"><input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={register ? "new-password" : "current-password"} className={`${field} pr-24`} placeholder="Minimal 6 karakter" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3 text-xs font-medium text-slate-600 hover:text-slate-900">{show ? "Sembunyikan" : "Tampilkan"}</button></div>
            </label>
            {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-700">{error}</p>}
            <button type="submit" disabled={!email || !password} className="h-11 w-full rounded-md bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-40">{register ? "Daftar" : "Masuk"}</button>
            {!register && <button type="button" onClick={() => alert("Hubungi admin sekolah untuk mengatur ulang kata sandi.")} className="block w-full text-center text-sm text-blue-700 hover:underline">Lupa kata sandi?</button>}
          </form>
          <div className="my-6 flex items-center gap-4 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />atau<span className="h-px flex-1 bg-slate-200" /></div>
          <p className="text-center text-sm text-slate-600">{register ? "Sudah punya akun?" : "Belum punya akun?"} <button type="button" onClick={switchMode} className="font-semibold text-blue-700 hover:underline">{register ? "Masuk" : "Daftar"}</button></p>
          <p className="mt-8 rounded-md bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">Akun uji: pengawas1@gmail.com atau admin1@gmail.com, kata sandi 123456.</p>
        </div>
      </section>
    </main>
  );
}

function Sidebar({ active, go, open, setOpen }: { active: Screen; go: (s: Screen) => void; open: boolean; setOpen: (v: boolean) => void }) {
  const { role } = useRole();
  const menus: Record<Role, { id: Screen; label: string; icon: IconName }[]> = {
    Siswa: [
      { id: "my-exams", label: "Sesi Ujian", icon: "calendar" },
      { id: "settings", label: "Profil", icon: "settings" },
    ],
    Pengawas: [
      { id: "dashboard", label: "Dasbor", icon: "grid" },
      { id: "sessions", label: "Sesi Ujian", icon: "calendar" },
      { id: "monitor", label: "Pemantauan", icon: "monitor" },
      { id: "indications", label: "Indikasi", icon: "bell" },
      { id: "history", label: "Riwayat", icon: "clock" },
      { id: "report", label: "Laporan", icon: "report" },
      { id: "settings", label: "Profil", icon: "settings" },
    ],
    "Penyelenggara Ujian": [
      { id: "dashboard", label: "Dasbor", icon: "grid" },
      { id: "sessions", label: "Sesi Ujian", icon: "calendar" },
      { id: "students", label: "Data Siswa", icon: "users" },
      { id: "settings", label: "Profil", icon: "settings" },
    ],
    Admin: [
      { id: "dashboard", label: "Dasbor", icon: "grid" },
      { id: "sessions", label: "Sesi Ujian", icon: "calendar" },
      { id: "students", label: "Data Siswa", icon: "users" },
      { id: "users", label: "Manajemen User", icon: "shield" },
      { id: "configuration", label: "Pengaturan", icon: "settings" },
      { id: "retention", label: "Retensi Data", icon: "clock" },
      { id: "audit", label: "Audit Log", icon: "file" },
      { id: "settings", label: "Profil", icon: "settings" },
    ],
    "Pihak Sekolah": [],
  };
  const nav = menus[role];
  return <>
    {open && <button className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden" aria-label="Tutup navigasi" onClick={() => setOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#16213a] p-5 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex items-center justify-between"><Logo dark /><button className="rounded-md p-2 text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)}><Icon name="close" /></button></div>
      <nav className="mt-10 flex-1 space-y-1">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Ruang kerja</p>
        {nav.map((item) => <button key={item.id} onClick={() => { go(item.id); setOpen(false); }} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${active === item.id || (["create", "exam-detail", "waiting"].includes(active) && item.id === "sessions") || (["detail", "student-detail", "timeline"].includes(active) && item.id === "monitor") ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}><Icon name={item.icon} size={19} />{item.label}</button>)}
      </nav>
      <div className="rounded-lg bg-white/5 p-3.5"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{role === "Siswa" ? "AP" : role === "Admin" ? "NA" : "RS"}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{role === "Siswa" ? "Alya Putri" : role === "Admin" ? "Nadia Aulia" : "Rina Setiawati"}</p><p className="truncate text-[11px] text-slate-400">{role}</p></div><button onClick={() => go("login")} className="text-slate-400 hover:text-white" aria-label="Keluar"><Icon name="arrow" size={16} /></button></div></div>
    </aside>
  </>;
}

function Topbar({ title, onMenu, go }: { title: string; onMenu: () => void; go: (s: Screen) => void }) {
  const { role } = useRole();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  return <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-8">
    <div className="flex min-w-0 items-center gap-3"><button className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={onMenu}><Icon name="menu" /></button><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{title}</p><p className="text-xs text-slate-500">SMA Negeri 8 Bandung</p></div></div>
    <div className="flex items-center gap-3 sm:gap-5">
      <div className="hidden items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 md:flex"><Icon name="clock" size={17} />01:18:42</div>
      <div className="relative"><button onClick={() => setNotificationsOpen(!notificationsOpen)} className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Buka notifikasi"><Icon name="bell" /><span className="absolute right-2 top-2 size-2 rounded-full bg-amber-500 ring-2 ring-white" /></button>{notificationsOpen && <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-md border border-slate-200 bg-white"><div className="border-b border-slate-100 p-4"><p className="text-sm font-bold text-slate-900">Notifikasi Pengawas</p><p className="mt-1 text-xs text-slate-500">2 Indikasi belum ditinjau</p></div><div className="divide-y divide-slate-100">{["Indikasi baru pada siswa Budi Santoso.","2 Indikasi belum ditinjau.","Citra Lestari mematikan kamera.","Hana Maharani mengalami koneksi terputus."].map((item, index) => <button key={item} onClick={() => { setNotificationsOpen(false); go(index < 2 ? "indications" : "monitor"); }} className="flex w-full gap-3 p-4 text-left hover:bg-slate-50"><span className={`mt-1 size-2 shrink-0 rounded-full ${index < 2 ? "bg-amber-500" : "bg-blue-600"}`} /><span><span className="block text-xs leading-5 text-slate-700">{item}</span><span className="mt-1 block text-[10px] text-slate-400">{index + 2} menit lalu</span></span></button>)}</div></div>}</div>
      <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-5"><div className="grid size-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{role === "Siswa" ? "AP" : role === "Admin" ? "NA" : "RS"}</div><div className="hidden sm:block"><p className="text-sm font-bold text-slate-800">{role === "Siswa" ? "Alya Putri" : role === "Admin" ? "Nadia Aulia" : "Rina Setiawati"}</p><p className="text-xs text-slate-500">{role}</p></div></div>
    </div>
  </header>;
}

function AppShell({ children, active, go, title }: { children: ReactNode; active: Screen; go: (s: Screen) => void; title: string }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-screen bg-slate-50"><Sidebar active={active} go={go} open={open} setOpen={setOpen} /><div className="lg:pl-64"><Topbar title={title} onMenu={() => setOpen(true)} go={go} />{children}</div></div>;
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">{eyebrow}</p>}<h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div>{action}</div>;
}

function Dashboard({ go }: { go: (s: Screen) => void }) {
  const { role } = useRole();
  if (role === "Siswa") return <StudentDashboard go={go} />;
  if (role === "Admin") return <AdminDashboard go={go} />;
  if (role === "Penyelenggara Ujian" || role === "Pihak Sekolah") return <InstitutionDashboard go={go} role={role} />;
  const summary = [
    ["2", "Sesi aktif", "video", "blue"],
    ["64", "Siswa sedang ujian", "users", "blue"],
    ["7", "Indikasi belum ditinjau", "bell", "amber"],
    ["5", "Indikasi valid", "check", "green"],
    ["2", "Perlu tinjauan lanjut", "clock", "amber"],
  ];
  return <AppShell active="dashboard" go={go} title="Dasbor"><main className="p-4 sm:p-8">
    <PageTitle title="Selamat pagi, Rina" description="Berikut ringkasan kegiatan ujian yang ditugaskan kepada Anda hari ini." />
    <section className="overflow-x-auto rounded-md border border-slate-200 bg-white"><div className="flex min-w-[760px] divide-x divide-slate-200">{summary.map(([num, label, icon, tone]) => <div key={label} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3"><span className={tone === "amber" ? "text-amber-600" : tone === "green" ? "text-emerald-600" : "text-slate-400"}><Icon name={icon as IconName} size={17} /></span><div><p className="text-lg font-bold leading-5 text-slate-900">{num}</p><p className="mt-0.5 whitespace-nowrap text-xs text-slate-500">{label}</p></div></div>)}</div></section>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-bold text-slate-900">Sesi aktif</h2><p className="mt-1 text-xs text-slate-500">Ujian yang sedang membutuhkan pengawasan.</p></div><button onClick={() => go("sessions")} className="text-xs font-semibold text-blue-700">Lihat semua</button></div>
        <div className="p-4"><button onClick={() => go("exam-detail")} className="w-full rounded-md border border-blue-100 bg-blue-50/50 p-5 text-left transition hover:border-blue-300"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><Badge tone="blue"><span className="size-1.5 animate-pulse rounded-full bg-blue-700" />Berlangsung</Badge><span className="text-xs text-slate-400">08.00–10.00 WIB</span></div><h3 className="mt-3 font-bold text-slate-900">Ujian Akhir Matematika XI</h3><p className="mt-1 text-sm text-slate-500">Matematika • XI IPA 2</p></div><div className="grid grid-cols-3 gap-5 text-center"><div><p className="font-bold text-slate-900">32</p><p className="text-[10px] text-slate-500">Peserta</p></div><div><p className="font-bold text-emerald-600">31</p><p className="text-[10px] text-slate-500">Terhubung</p></div><div><p className="font-bold text-amber-600">7</p><p className="text-[10px] text-slate-500">Indikasi</p></div></div></div><div className="mt-5 flex items-center justify-between border-t border-blue-100 pt-4"><p className="text-xs text-blue-700">Sisa waktu 01:18:42</p><span className="flex items-center gap-1 text-xs font-bold text-blue-700">Buka pemantauan <Icon name="chevron" size={14} /></span></div></button></div>
        <div className="border-t border-slate-100 px-4 py-3"><button onClick={() => go("waiting")} className="flex w-full items-center justify-between rounded-md p-3 text-left hover:bg-slate-50"><div><p className="text-sm font-semibold text-slate-800">Ulangan Kimia XI</p><p className="mt-1 text-xs text-slate-500">XI IPA 1 • Mulai pukul 13.00 • 28 siswa</p></div><Badge tone="gray">Dijadwalkan</Badge></button></div>
      </section>
      <section className="rounded-md border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="font-bold text-slate-900">Indikasi terbaru</h2><p className="mt-1 text-xs text-slate-500">Hanya tampilkan yang memerlukan perhatian.</p></div><div className="divide-y divide-slate-100">{indications.slice(0, 3).map((item, index) => <button key={item.time} onClick={() => go("detail")} className="flex w-full gap-3 p-4 text-left hover:bg-slate-50"><div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600"><Icon name="bell" size={15} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{item.type}</p><p className="mt-1 truncate text-xs text-slate-500">{item.name} • Matematika</p></div><span className="text-[10px] text-slate-400">{index + 3} mnt</span></button>)}</div></section>
    </div>
    <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-bold text-slate-900">Ujian yang Ditugaskan</h2><p className="mt-1 text-xs text-slate-500">Hanya sesi yang ditugaskan kepada Rina Setiawati.</p></div><button onClick={() => go("sessions")} className="text-xs font-semibold text-blue-700">Lihat semua sesi</button></div><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Nama ujian</th><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Jam</th><th className="px-5 py-3">Durasi</th><th className="px-5 py-3">Peserta</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Indikasi</th><th className="px-5 py-3">Aksi</th></tr></thead><tbody>{sessions.slice(0,3).map((s,index) => <tr key={s.name} className="border-t border-slate-100"><td className="px-5 py-4 font-semibold text-slate-800">{s.name}</td><td className="px-5 py-4 text-slate-600">{s.date}</td><td className="px-5 py-4 text-slate-600">{s.time} WIB</td><td className="px-5 py-4 text-slate-600">{s.duration}</td><td className="px-5 py-4 text-slate-600">{s.students}</td><td className="px-5 py-4"><Badge tone={s.status === "Selesai" ? "green" : s.status === "Berlangsung" ? "blue" : "gray"}>{s.status === "Berlangsung" ? "Sedang Berlangsung" : s.status === "Belum mulai" ? "Akan Dimulai" : s.status}</Badge></td><td className="px-5 py-4 font-semibold text-slate-700">{[7,0,12][index]}</td><td className="px-5 py-4"><button onClick={() => go("exam-detail")} className="text-xs font-bold text-blue-700">Lihat</button></td></tr>)}</tbody></table></div></section>
  </main></AppShell>;
}

function Sessions({ go }: { go: (s: Screen) => void }) {
  const { role } = useRole();
  const { createdExam } = useExam();
  const canCreate = role === "Admin" || role === "Penyelenggara Ujian";
  const [removed, setRemoved] = useState<string[]>([]);
  const displaySessions = createdExam ? [{ name: createdExam.name, date: createdExam.date, time: createdExam.start, duration: `${createdExam.duration} menit`, students: createdExam.students.length, status: createdExam.status }, ...sessions] : sessions;
  return <AppShell active="sessions" go={go} title="Daftar Sesi Ujian"><main className="p-4 sm:p-8">
    <PageTitle title={role === "Admin" ? "Daftar Ujian" : "Daftar Sesi Ujian"} description={role === "Pengawas" ? "Sesi yang ditugaskan kepada Anda." : role === "Admin" ? "Atur jadwal, peserta, pengawas, dan status ujian." : "Lihat jadwal dan aktivitas ujian sekolah."} action={canCreate ? <Button icon="plus" onClick={() => go("create")}>Create Ujian</Button> : undefined} />
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative max-w-sm flex-1"><span className="absolute left-3 top-2.5 text-slate-400"><Icon name="search" size={18} /></span><input placeholder="Cari nama ujian..." className="h-10 w-full rounded-md border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500" /></div><select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600"><option>Semua status</option><option>Berlangsung</option><option>Selesai</option></select></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5">Nama ujian</th><th className="px-5 py-3.5">Tanggal & waktu</th><th className="px-5 py-3.5">Durasi</th><th className="px-5 py-3.5">Peserta</th><th className="px-5 py-3.5">Pengawas</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Aksi</th></tr></thead><tbody>{displaySessions.filter((s) => !removed.includes(s.name)).map((s) => <tr key={s.name} className="border-t border-slate-100 hover:bg-slate-50/70"><td className="px-5 py-4 font-semibold text-slate-800">{s.name}<p className="mt-1 text-xs font-normal text-slate-400">Matematika • XI IPA 2</p></td><td className="px-5 py-4 text-slate-600">{s.date}<span className="ml-2 text-slate-400">• {s.time}</span></td><td className="px-5 py-4 text-slate-600">{s.duration}</td><td className="px-5 py-4 text-slate-600">{s.students} siswa</td><td className="px-5 py-4 text-slate-600">{createdExam && s.name === createdExam.name ? createdExam.supervisor : "Rina Setiawati"}</td><td className="px-5 py-4"><Badge tone={s.status === "Berlangsung" || s.status === "Sedang Berlangsung" ? "blue" : s.status === "Selesai" ? "green" : "gray"}>{s.status === "Berlangsung" ? "Sedang Berlangsung" : s.status === "Belum mulai" ? "Terjadwal" : s.status}</Badge></td><td className="px-5 py-4"><div className="flex items-center gap-3 whitespace-nowrap"><button onClick={() => go("exam-detail")} className="text-xs font-bold text-blue-700">Lihat Detail</button>{role === "Admin" && <><button onClick={() => go("create")} className="text-xs font-semibold text-slate-600">Edit</button><button onClick={() => go("students")} className="text-xs font-semibold text-slate-600">Kelola Peserta</button><button onClick={() => { if (window.confirm(`Hapus sesi "${s.name}" dari daftar?`)) { setRemoved([...removed, s.name]); notify("Sesi dihapus dari daftar."); } }} className="text-xs font-semibold text-amber-700">Hapus</button></>}</div></td></tr>)}</tbody></table></div>
    </div>
  </main></AppShell>;
}

function ExamDetail({ go }: { go: (s: Screen) => void }) {
  const [tab, setTab] = useState("Ringkasan");
  return <AppShell active="exam-detail" go={go} title="Detail Ujian"><main className="p-4 sm:p-8">
    <button onClick={() => go("sessions")} className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"><Icon name="arrow" size={18} />Kembali ke daftar ujian</button>
    <div className="rounded-md border border-slate-200 bg-white p-6"><div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start"><div><div className="flex items-center gap-3"><Badge tone="blue"><span className="size-1.5 rounded-full bg-blue-700" />Sedang Berlangsung</Badge><span className="text-xs text-slate-400">Kode ujian EX-Matematika-0525</span></div><h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Ujian Akhir Matematika XI</h1><p className="mt-2 text-sm text-slate-500">Matematika • Kelas XI IPA 2</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => go("students")}>Daftar Siswa</Button><Button variant="secondary" onClick={() => go("indications")}>Lihat Indikasi</Button><Button variant="secondary" onClick={() => go("report")}>Lihat Laporan</Button><Button icon="monitor" onClick={() => go("monitor")}>Mulai Monitoring</Button></div></div>
      <div className="mt-7 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">{[["Tanggal & waktu","24 Mei 2025, 08.00","calendar"],["Durasi","120 menit","clock"],["Peserta","32 siswa","users"],["Pengawas","Rina Setiawati","shield"]].map(([k,v,i]) => <div key={k} className="flex gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-md bg-slate-50 text-slate-500"><Icon name={i as IconName} size={17} /></div><div><p className="text-xs text-slate-400">{k}</p><p className="mt-1 text-sm font-semibold text-slate-800">{v}</p></div></div>)}</div>
    </div>
    <div className="mt-6 border-b border-slate-200"><div className="flex gap-7 overflow-x-auto">{["Ringkasan","Peserta","Pemantauan","Laporan"].map((x) => <button key={x} onClick={() => setTab(x)} className={`whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold ${tab === x ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500"}`}>{x}</button>)}</div></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.8fr]"><section className="rounded-md border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">{tab}</h2>{tab === "Ringkasan" ? <><p className="mt-3 text-sm leading-7 text-slate-600">Ujian akhir untuk mengevaluasi pemahaman siswa mengenai logika, himpunan, relasi, fungsi, dan teori graf. Seluruh peserta wajib mengaktifkan kamera dan mikrofon selama sesi.</p><div className="mt-6 rounded-md bg-blue-50 p-4"><div className="flex gap-3"><span className="text-blue-700"><Icon name="shield" size={19} /></span><div><p className="text-sm font-bold text-blue-900">Pemantauan bertanggung jawab</p><p className="mt-1 text-xs leading-5 text-blue-800">AI hanya memberikan Indikasi dan bukti pendukung. Pengawas meninjau bukti sebelum menentukan keputusan.</p></div></div></div></> : <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><Icon name={tab === "Peserta" ? "users" : tab === "Laporan" ? "report" : "monitor"} size={28} /><p className="mt-3 text-sm font-semibold text-slate-700">{tab === "Laporan" ? "Laporan tersedia setelah ujian selesai" : `${tab} ujian siap ditinjau`}</p></div>}</section>
      <aside className="rounded-md border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Kesiapan sesi</h2><div className="mt-5 space-y-4">{[["Peserta terdaftar","32","green"],["Sudah terhubung","31","green"],["Masalah perangkat","1","amber"],["Belum bergabung","0","gray"]].map(([k,v,t]) => <div key={k} className="flex items-center justify-between"><span className="text-sm text-slate-500">{k}</span><Badge tone={t as "green" | "amber" | "gray"}>{v}</Badge></div>)}</div><Button variant="secondary" className="mt-6 w-full" onClick={() => go("waiting")}>Periksa ruang tunggu</Button></aside></div>
  </main></AppShell>;
}

function WaitingRoom({ go }: { go: (s: Screen) => void }) {
  const rows = [
    ["Alya Putri","2301034","Siap","Aktif","Aktif","Stabil"],
    ["Bima Pratama","2301035","Siap","Aktif","Aktif","Stabil"],
    ["Citra Lestari","2301036","Masalah mikrofon","Aktif","Tidak aktif","Stabil"],
    ["Dimas Saputra","2301037","Siap","Aktif","Aktif","Stabil"],
    ["Farah Nabila","2301038","Masalah kamera","Tidak aktif","Aktif","Stabil"],
    ["Hana Maharani","2301040","Belum bergabung","—","—","—"],
  ];
  return <AppShell active="waiting" go={go} title="Ruang Tunggu Ujian"><main className="p-4 sm:p-8">
    <PageTitle eyebrow="Mulai dalam 18 menit" title="Ruang Tunggu Ujian" description="Ujian Akhir Matematika XI • 24 Mei 2025, 08.00 WIB" action={<Button icon="monitor" onClick={() => go("monitor")}>Mulai Pemantauan Ujian</Button>} />
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white"><div className="flex min-w-[620px] divide-x divide-slate-200">{[["31/32","Sudah bergabung","users","blue"],["29","Siap mengikuti","check","green"],["2","Masalah perangkat","camera","amber"],["1","Belum bergabung","clock","gray"]].map(([n,l,i,t]) => <div key={l} className="flex flex-1 items-center gap-3 px-4 py-3"><span className={t === "amber" ? "text-amber-600" : t === "green" ? "text-emerald-600" : "text-slate-400"}><Icon name={i as IconName} size={17} /></span><div><p className="text-lg font-bold leading-5 text-slate-900">{n}</p><p className="mt-0.5 whitespace-nowrap text-xs text-slate-500">{l}</p></div></div>)}</div></div>
    <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Status peserta</h2><p className="mt-1 text-xs text-slate-500">Status diperbarui otomatis dari ruang video.</p></div><div className="relative"><span className="absolute left-3 top-2.5 text-slate-400"><Icon name="search" size={17} /></span><input className="h-10 rounded-md border border-slate-200 pl-9 pr-3 text-sm" placeholder="Cari siswa" /></div></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Siswa</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Kamera</th><th className="px-5 py-3">Mikrofon</th><th className="px-5 py-3">Koneksi</th><th className="px-5 py-3" /></tr></thead><tbody>{rows.map((r) => <tr key={r[1]} className="border-t border-slate-100"><td className="px-5 py-4"><p className="font-semibold text-slate-800">{r[0]}</p><p className="text-xs text-slate-400">{r[1]}</p></td><td className="px-5 py-4"><Badge tone={r[2] === "Siap" ? "green" : r[2] === "Belum bergabung" ? "gray" : "amber"}>{r[2]}</Badge></td><td className="px-5 py-4 text-slate-600">{r[3]}</td><td className="px-5 py-4 text-slate-600">{r[4]}</td><td className="px-5 py-4 text-slate-600">{r[5]}</td><td className="px-5 py-4 text-right"><button onClick={() => notify("Hubungi: tersedia setelah backend terhubung.")} className="text-xs font-semibold text-blue-700">Hubungi</button></td></tr>)}</tbody></table></div></section>
    <div className="mt-5 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4"><span className="text-amber-600"><Icon name="bell" size={18} /></span><div><p className="text-sm font-bold text-amber-900">Dua peserta memerlukan bantuan</p><p className="mt-1 text-xs leading-5 text-amber-800">Pastikan masalah kamera dan mikrofon diselesaikan sebelum memulai pemantauan.</p></div></div>
  </main></AppShell>;
}

function CreateSession({ go }: { go: (s: Screen) => void }) {
  return <AppShell active="create" go={go} title="Buat Sesi Ujian"><main className="mx-auto max-w-5xl p-4 sm:p-8">
    <button onClick={() => go("sessions")} className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"><Icon name="arrow" size={18} />Kembali ke daftar sesi</button>
    <PageTitle eyebrow="Sesi baru" title="Buat Sesi Ujian" description="Lengkapi detail ujian dan daftarkan peserta." />
    <div className="mb-7 grid grid-cols-2 gap-2 rounded-md border border-slate-200 bg-white p-2 sm:grid-cols-4">{[["1","Informasi"],["2","Peserta"],["3","Pemantauan"],["4","Tinjau"]].map(([n,l], i) => <div key={n} className={`flex items-center gap-2 rounded-md p-3 ${i === 0 ? "bg-blue-50 text-blue-700" : "text-slate-500"}`}><span className={`grid size-6 place-items-center rounded-full text-xs font-bold ${i === 0 ? "bg-blue-700 text-white" : "bg-slate-100"}`}>{n}</span><span className="text-xs font-semibold">{l}</span></div>)}</div>
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="rounded-md border border-slate-200 bg-white p-6"><div className="mb-6 flex items-center gap-3"><div className="grid size-9 place-items-center rounded-md bg-blue-50 text-blue-700"><Icon name="file" size={19} /></div><div><h2 className="font-bold text-slate-900">Informasi ujian</h2><p className="text-xs text-slate-500">Informasi utama sesi ujian.</p></div></div><div className="grid gap-5 sm:grid-cols-2"><div className="sm:col-span-2"><Field label="Nama ujian" placeholder="Contoh: Ujian Akhir Matematika XII" /></div><Field label="Tanggal" type="date" /><Field label="Jam mulai" type="time" /><Field label="Durasi (menit)" type="number" placeholder="120" /><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Pengawas</span><select className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"><option>Rina Setiawati</option><option>Agus Wirawan</option></select></label></div></section>
        <section className="rounded-md border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Daftar siswa</h2><p className="mt-1 text-xs text-slate-500">Tambahkan siswa yang akan mengikuti sesi.</p></div><div className="flex gap-2"><Button variant="secondary" icon="upload">Impor file</Button><Button variant="secondary" icon="plus">Tambah siswa</Button></div></div><div className="p-6"><div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><div className="mx-auto grid size-11 place-items-center rounded-full bg-white text-slate-400"><Icon name="users" /></div><p className="mt-3 text-sm font-semibold text-slate-700">Belum ada siswa</p><p className="mt-1 text-xs text-slate-500">Tambahkan satu per satu atau impor daftar dari file.</p></div></div></section>
      </div>
      <aside className="h-fit rounded-md border border-blue-100 bg-blue-50 p-5"><h3 className="font-bold text-blue-900">Sebelum menerbitkan</h3><ul className="mt-4 space-y-3 text-sm text-blue-800">{["Pastikan jadwal sudah sesuai", "Periksa daftar pengawas", "Peserta akan menerima tautan ujian"].map((x) => <li key={x} className="flex gap-2"><span className="mt-0.5 text-blue-700"><Icon name="check" size={16} /></span>{x}</li>)}</ul></aside>
    </div>
    <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row"><Button variant="ghost" onClick={() => go("sessions")}>Batal</Button><div className="flex gap-3"><Button variant="secondary" onClick={() => go("sessions")}>Simpan sebagai draf</Button><Button onClick={() => go("exam-detail")}>Tinjau & jadwalkan</Button></div></div>
  </main></AppShell>;
}

function AdminCreateExam({ go }: { go: (s: Screen) => void }) {
  const { setCreatedExam } = useExam();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("08:00");
  const [duration, setDuration] = useState("60");
  const [supervisor, setSupervisor] = useState("");
  const [status, setStatus] = useState("Draft");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const participantOptions = ["Alya Putri • NIM 2301034","Bima Pratama • NIM 2301035","Citra Lestari • NIM 2301036","Dimas Saputra • NIM 2301037","Farah Nabila • NIM 2301038","Gilang Ramadhan • NIM 2301039"];
  const toggle = (student: string) => setSelected((current) => current.includes(student) ? current.filter((item) => item !== student) : [...current, student]);
  const submit = () => {
    if (!name || !description || !date || !start || !duration || !supervisor || selected.length === 0) { setError("Lengkapi seluruh field wajib dan pilih minimal satu peserta."); return; }
    setCreatedExam({ name, description, date, start, duration, supervisor, status, students: selected });
    go("sessions");
  };
  return <AppShell active="create" go={go} title="Create Ujian"><main className="mx-auto max-w-6xl p-4 sm:p-8">
    <button onClick={() => go("sessions")} className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"><Icon name="arrow" size={18} />Kembali ke Daftar Ujian</button>
    <PageTitle eyebrow="Khusus Admin" title="Create Ujian" description="Tentukan jadwal, peserta yang diizinkan, dan pengawas sebelum menerbitkan ujian." />
    {error && <div role="alert" className="mb-5 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900"><Icon name="bell" size={18} />{error}</div>}
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]"><div className="space-y-6">
      <section className="rounded-md border border-slate-200 bg-white p-6"><div className="mb-6 flex items-center gap-3"><div className="grid size-9 place-items-center rounded-md bg-blue-50 text-blue-700"><Icon name="file" size={18} /></div><div><h2 className="font-bold text-slate-900">Informasi ujian</h2><p className="text-xs text-slate-500">Field bertanda wajib harus diisi.</p></div></div><div className="grid gap-5 sm:grid-cols-2"><label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Nama Ujian *</span><input value={name} onChange={(e) => setName(e.target.value)} className="h-11 w-full rounded-md border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-500" placeholder="Contoh: Ujian Akhir Matematika XI" /></label><label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Deskripsi *</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full resize-none rounded-md border border-slate-200 p-3.5 text-sm outline-none focus:border-blue-500" placeholder="Jelaskan materi dan ketentuan ujian" /></label><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Tanggal Ujian *</span><input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm" /></label><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Jam Mulai *</span><input value={start} onChange={(e) => setStart(e.target.value)} type="time" className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm" /></label><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Durasi *</span><div className="flex"><input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" min="1" className="h-11 min-w-0 flex-1 rounded-l-md border border-slate-200 px-3 text-sm" /><span className="grid h-11 place-items-center rounded-r-md border border-l-0 border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">menit</span></div></label><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Status Ujian *</span><select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"><option>Draft</option><option>Terjadwal</option><option>Sedang Berlangsung</option><option>Selesai</option></select></label></div></section>
      <section className="rounded-md border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-bold text-slate-900">Peserta yang diizinkan</h2><p className="mt-1 text-xs text-slate-500">Hanya siswa terpilih yang akan melihat ujian ini.</p></div><Badge tone={selected.length ? "blue" : "gray"}>{selected.length} dipilih</Badge></div><label className="flex cursor-pointer items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={selected.length === participantOptions.length} onChange={() => setSelected(selected.length === participantOptions.length ? [] : participantOptions)} className="size-4 accent-blue-700" />Pilih semua</label><div className="grid sm:grid-cols-2">{participantOptions.map((student) => <label key={student} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-5 py-4 text-sm text-slate-700 hover:bg-slate-50"><input type="checkbox" checked={selected.includes(student)} onChange={() => toggle(student)} className="size-4 accent-blue-700" /><span>{student}</span></label>)}</div></section>
    </div><aside className="h-fit space-y-5"><section className="rounded-md border border-slate-200 bg-white p-5"><h2 className="font-bold text-slate-900">Penugasan pengawas</h2><p className="mt-1 text-xs leading-5 text-slate-500">Pengawas hanya dapat melihat sesi yang ditugaskan.</p><label className="mt-5 block"><span className="mb-2 block text-sm font-semibold text-slate-700">Pilih Pengawas *</span><select value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">Pilih pengawas</option><option>Rina Setiawati</option><option>Agus Wirawan</option><option>Nina Kartika</option></select></label></section><section className="rounded-md border border-blue-100 bg-blue-50 p-5"><h3 className="font-bold text-blue-900">Ringkasan akses</h3><ul className="mt-4 space-y-3 text-xs leading-5 text-blue-800"><li>{selected.length} peserta dipilih</li><li>{supervisor || "Pengawas belum dipilih"}</li><li>Status: {status}</li><li>Jadwal ditentukan Admin dan tidak dapat diubah siswa.</li></ul></section></aside></div>
    <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-6"><Button variant="secondary" onClick={() => go("sessions")}>Batal</Button><Button onClick={submit}>Buat Ujian</Button></div>
  </main></AppShell>;
}

function StudentHeader({ step }: { step?: number }) {
  return <header className="flex h-18 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-10"><Logo /><div className="hidden items-center gap-3 sm:flex"><div className="grid size-8 place-items-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">AP</div><div><p className="text-sm font-bold text-slate-800">Alya Putri</p><p className="text-xs text-slate-500">NIS 120034</p></div></div>{step && <div className="text-xs font-semibold text-slate-500 sm:hidden">Langkah {step} dari 2</div>}</header>;
}

function Consent({ go }: { go: (s: Screen) => void }) {
  const [agreed, setAgreed] = useState(false);
  const [minor, setMinor] = useState(false);
  const [guardian, setGuardian] = useState("");
  const [declined, setDeclined] = useState(false);
  return <div className="min-h-screen bg-slate-50"><StudentHeader step={2} /><main className="mx-auto max-w-3xl p-5 py-10 sm:py-16">
    <div className="mb-8 flex items-center justify-center gap-2">{[1, 2].map((n) => <div key={n} className="flex items-center gap-2">{n > 1 && <div className="h-px w-12 bg-blue-200" />}<div className="grid size-8 place-items-center rounded-full bg-blue-700 text-xs font-bold text-white">{n === 1 ? <Icon name="check" size={14} /> : n}</div></div>)}</div>
    <section className="rounded-md border border-slate-200 bg-white p-6 sm:p-10">
      <div className="grid size-12 place-items-center rounded-md bg-blue-50 text-blue-700"><Icon name="shield" size={25} /></div><p className="mt-6 text-xs font-bold uppercase tracking-widest text-blue-700">Langkah 2 dari 2</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Persetujuan Perekaman</h1><p className="mt-3 leading-7 text-slate-600">Untuk mendukung pengawasan ujian, video dan audio Anda akan direkam selama sesi berlangsung dan dianalisis oleh AI untuk memberikan Indikasi kepada pengawas.</p>
      <div className="my-7 grid gap-3 sm:grid-cols-2">{[["video","Data yang direkam","Kamera, mikrofon, dan aktivitas koneksi selama ujian."],["monitor","Analisis AI","Posisi wajah, pergerakan, suara, dan kestabilan perangkat untuk menghasilkan Indikasi."],["shield","Tujuan penggunaan","Mendukung pengawas dalam meninjau jalannya ujian secara bertanggung jawab."],["users","Akses & masa simpan","Pengawas berwenang dapat mengakses data. Rekaman disimpan maksimal 90 hari."]].map(([icon,title,copy]) => <div key={title} className="rounded-md bg-slate-50 p-4"><div className="flex items-center gap-2 font-bold text-slate-800"><Icon name={icon as IconName} size={18} />{title}</div><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p></div>)}</div>
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Perlu diketahui:</strong> AI hanya memberikan Indikasi. Setiap keputusan akhir selalu dibuat oleh pengawas setelah meninjau bukti.</div>
      <div className="mt-7 rounded-md border border-slate-200 p-4"><label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-slate-800"><input type="checkbox" checked={minor} onChange={(e) => setMinor(e.target.checked)} className="size-5 accent-blue-600" />Usia saya di bawah 18 tahun</label>{minor && <div className="mt-4"><label className="block text-sm font-semibold text-slate-700">Nama orang tua/wali yang menyetujui<input value={guardian} onChange={(e) => setGuardian(e.target.value)} placeholder="Nama lengkap orang tua atau wali" className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-normal" /></label><p className="mt-2 text-xs leading-5 text-slate-500">Persetujuan orang tua/wali dicatat bersama waktu dan versi teks pemberitahuan ini.</p></div>}</div>
      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-4 transition hover:bg-slate-50"><input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 size-5 rounded border-slate-300 accent-blue-600" /><span><span className="block text-sm font-bold text-slate-800">Saya telah membaca dan menyetujui pemberitahuan perekaman dan analisis data.</span><span className="mt-1 block text-xs leading-5 text-slate-500">Persetujuan diperlukan untuk mengikuti ujian ini.</span></span></label>
      {declined && <p role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">Tanpa persetujuan, Anda tidak dapat mengikuti ujian ini. Hubungi pengawas atau pihak sekolah.</p>}
      <div className="mt-7 flex justify-between"><Button variant="ghost" onClick={() => setDeclined(true)}>Tolak</Button><Button disabled={!agreed || (minor && !guardian.trim())} onClick={() => go("exam")}>Setuju & Masuk Ujian <Icon name="chevron" size={17} /></Button></div>
    </section>
  </main></div>;
}

let sharedStream: MediaStream | null = null;
const stopShared = () => { sharedStream?.getTracks().forEach((t) => t.stop()); sharedStream = null; };

function Device({ go }: { go: (s: Screen) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const keep = useRef(false);
  const [state, setState] = useState<"asking" | "ok" | "error">("asking");
  const [error, setError] = useState("");
  const [camOk, setCamOk] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [level, setLevel] = useState(0);
  const [latency, setLatency] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let raf = 0, alive = true;
    let ctx: AudioContext | undefined;
    stopShared(); setState("asking"); setError(""); setCamOk(false); setMicOk(false);
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) { setState("error"); setError("Browser ini tidak mendukung akses kamera. Gunakan Chrome, Edge, atau Firefox terbaru dan buka lewat localhost atau HTTPS."); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!alive) { stream.getTracks().forEach((t) => t.stop()); return; }
        sharedStream = stream;
        setCamOk(stream.getVideoTracks().length > 0); setMicOk(stream.getAudioTracks().length > 0);
        if (videoRef.current) videoRef.current.srcObject = stream;
        ctx = new AudioContext();
        const an = ctx.createAnalyser(); an.fftSize = 256;
        ctx.createMediaStreamSource(stream).connect(an);
        const buf = new Uint8Array(an.frequencyBinCount);
        const tick = () => { an.getByteFrequencyData(buf); setLevel(Math.min(1, buf.reduce((a, b) => a + b, 0) / buf.length / 70)); raf = requestAnimationFrame(tick); };
        tick(); setState("ok");
      } catch (e) {
        const n = (e as DOMException).name;
        setState("error");
        setError(n === "NotAllowedError" ? "Izin kamera atau mikrofon ditolak. Klik ikon gembok di kolom alamat browser, ubah izin Kamera dan Mikrofon menjadi Izinkan, lalu coba lagi." : n === "NotFoundError" ? "Kamera atau mikrofon tidak ditemukan. Pastikan perangkat terpasang." : n === "NotReadableError" ? "Kamera atau mikrofon sedang dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi." : "Perangkat tidak dapat diakses. Coba muat ulang halaman.");
      }
    })();
    const t0 = performance.now();
    fetch(window.location.href, { method: "HEAD", cache: "no-store" }).then(() => alive && setLatency(Math.round(performance.now() - t0))).catch(() => alive && setLatency(null));
    return () => { alive = false; cancelAnimationFrame(raf); ctx?.close(); if (!keep.current) stopShared(); };
  }, [attempt]);

  const ready = state === "ok" && camOk && micOk && navigator.onLine;
  const net = latency === null ? ["Tidak terukur", "gray"] : latency < 150 ? ["Baik", "green"] : latency < 400 ? ["Cukup", "amber"] : ["Lambat", "amber"];
  const status = (ok: boolean, label: string) => state === "asking" ? <Badge tone="gray">Memeriksa</Badge> : ok ? <Badge tone="green"><Icon name="check" size={13} />{label}</Badge> : <Badge tone="amber">Bermasalah</Badge>;
  return <div className="min-h-screen bg-slate-50"><StudentHeader step={1} /><main className="mx-auto max-w-5xl p-5 py-10">
    <div className="mb-8 text-center"><p className="text-sm font-medium text-blue-700">Langkah 1 dari 2</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Cek Perangkat</h1><p className="mt-2 text-slate-500">Izinkan akses kamera dan mikrofon saat browser meminta, lalu pastikan semuanya terdeteksi.</p></div>
    <div className="grid gap-5 lg:grid-cols-[1.4fr_.8fr]">
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="relative aspect-video bg-slate-800"><video ref={videoRef} autoPlay muted playsInline className="size-full -scale-x-100 object-cover" />{state !== "ok" && <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm leading-6 text-slate-300">{state === "asking" ? "Menunggu izin kamera dan mikrofon dari browser..." : "Kamera belum dapat ditampilkan."}</div>}</div><div className="flex items-center justify-between p-4"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Icon name="camera" size={18} />Kamera</div>{status(camOk, "Terdeteksi")}</div></section>
      <div className="space-y-5"><section className="rounded-md border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Icon name="mic" size={18} />Mikrofon</div>{status(micOk, "Terdeteksi")}</div><div className="mt-5 flex h-12 items-end gap-1">{Array.from({ length: 12 }, (_, i) => <span key={i} className={`flex-1 rounded-sm ${level * 12 > i ? "bg-blue-600" : "bg-slate-200"}`} style={{ height: `${12 + i * 3}px` }} />)}</div><p className="mt-3 text-xs text-slate-500">Ucapkan beberapa kata, batang biru akan naik jika suara terdengar.</p></section>
        <section className="rounded-md border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Icon name="wifi" size={18} />Koneksi internet</div><Badge tone={net[1] as "green" | "amber" | "gray"}>{navigator.onLine ? net[0] : "Offline"}</Badge></div><p className="mt-4 text-2xl font-semibold text-slate-900">{latency === null ? "-" : `${latency} ms`}</p><p className="text-xs text-slate-500">Waktu respons ke server</p></section></div>
    </div>
    <div className={`mt-6 flex flex-col items-center justify-between gap-4 rounded-md border p-5 sm:flex-row ${ready ? "border-emerald-100 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}><div><p className={`font-semibold ${ready ? "text-emerald-900" : "text-amber-900"}`}>{ready ? "Semua perangkat siap" : state === "asking" ? "Memeriksa perangkat" : "Perangkat belum siap"}</p><p className={`mt-1 text-sm leading-6 ${ready ? "text-emerald-700" : "text-amber-800"}`}>{ready ? "Lanjutkan untuk membaca pemberitahuan perekaman." : error || "Kamera dan mikrofon wajib terdeteksi sebelum masuk ujian."}</p></div><div className="flex gap-2">{state === "error" && <Button variant="secondary" onClick={() => setAttempt(attempt + 1)}>Coba lagi</Button>}<Button disabled={!ready} onClick={() => { keep.current = true; go("consent"); }}>Lanjut ke Persetujuan</Button></div></div>
  </main></div>;
}

type Detection = { id: string; studentName: string; indicator: string; start: string; score: number };
function useDetections() {
  const [rows, setRows] = useState<Detection[] | null>(null);
  useEffect(() => {
    const load = () => fetch("/api/detections").then((r) => (r.ok ? r.json() : Promise.reject())).then(setRows).catch(() => setRows(null));
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);
  return rows;
}

function OpenViduFrame({ role, className = "", fallback }: { role: "speaker" | "moderator"; className?: string; fallback: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    let dead = false;
    stopShared();
    (async () => {
      try {
        const r = await fetch(`/api/room/access?role=${role}`);
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "Server belum siap");
        if (!customElements.get("openvidu-meet")) await new Promise<void>((ok, bad) => { const sc = document.createElement("script"); sc.src = d.scriptUrl; sc.onload = () => ok(); sc.onerror = () => bad(new Error("Gagal memuat " + d.scriptUrl)); document.head.appendChild(sc); });
        if (dead || !box.current) return;
        const el = document.createElement("openvidu-meet");
        el.setAttribute("room-url", d.roomUrl);
        el.style.cssText = "display:block;width:100%;height:100%";
        box.current.replaceChildren(el);
        setStatus("ok");
      } catch (e) { if (!dead) { setMsg((e as Error).message); setStatus("error"); } }
    })();
    return () => { dead = true; };
  }, [role]);
  if (status === "error") return <>{fallback}<p role="alert" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-md bg-amber-100 px-4 py-2 text-xs text-amber-900">Mode contoh, OpenVidu belum tersambung: {msg}</p></>;
  return <div className={`relative ${className}`}><div ref={box} className="absolute inset-0" />{status === "loading" && <p className="absolute inset-0 grid place-items-center text-sm text-slate-400">Menyambungkan ke ruang ujian...</p>}</div>;
}

function ExamRoom({ go }: { go: (s: Screen) => void }) {
  const vref = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (vref.current && sharedStream) vref.current.srcObject = sharedStream; }, []);
  return <div className="flex min-h-screen flex-col bg-slate-950 text-white">
    <header className="flex h-18 items-center justify-between border-b border-white/10 px-5 sm:px-8"><div><p className="text-sm font-bold">Ujian Akhir Matematika XII</p><p className="text-xs text-slate-400">Ruang ujian • 32 peserta</p></div><div className="flex items-center gap-4"><div className="rounded-md bg-white/10 px-4 py-2 text-sm font-bold"><span className="mr-2 text-slate-400">Sisa waktu</span>01:18:42</div><button onClick={() => { stopShared(); go("dashboard"); }} className="hidden text-xs font-semibold text-slate-400 hover:text-white sm:block">Keluar dari ujian</button></div></header>
    <OpenViduFrame role="speaker" className="flex-1" fallback={<main className="relative flex flex-1 items-center justify-center overflow-hidden p-5"><div className="relative text-center"><div className="mx-auto grid size-28 place-items-center rounded-full bg-slate-800 text-3xl font-bold text-slate-200 ring-1 ring-slate-700">AU</div><p className="mt-5 font-semibold">Agus Wirawan • Pengawas</p><p className="mt-1 text-sm text-slate-400">Ujian sedang berlangsung</p></div>
      <div className="absolute bottom-5 right-5 w-44 overflow-hidden rounded-md border border-white/20 bg-slate-800 sm:w-56"><div className="flex aspect-video items-center justify-center bg-slate-800">{sharedStream ? <video ref={vref} autoPlay muted playsInline className="size-full -scale-x-100 object-cover" /> : <div className="grid size-14 place-items-center rounded-full bg-white/10 font-bold">AP</div>}</div><div className="flex items-center justify-between px-3 py-2 text-xs"><span>Alya Putri</span><span className="text-emerald-400"><Icon name="mic" size={14} /></span></div></div>
    </main>} />
    <footer className="flex h-20 items-center justify-between border-t border-white/10 px-5 sm:px-8"><div className="flex items-center gap-2 text-xs text-emerald-400"><span className="size-2 rounded-full bg-emerald-400" />Koneksi stabil</div><div className="flex gap-3"><div className="grid size-11 place-items-center rounded-full bg-white/10"><Icon name="mic" /></div><div className="grid size-11 place-items-center rounded-full bg-white/10"><Icon name="camera" /></div></div><div className="hidden text-xs text-slate-500 sm:block">Perekaman aktif</div></footer>
  </div>;
}

function MonitorState({ state }: { state: "empty" | "loading" | "offline" }) {
  if (state === "loading") return <div className="grid flex-1 grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="aspect-video animate-pulse rounded-md bg-slate-200" />)}</div>;
  const offline = state === "offline";
  return <div className="flex flex-1 items-center justify-center p-8 text-center"><div className="max-w-sm"><div className={`mx-auto grid size-14 place-items-center rounded-full ${offline ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-400"}`}><Icon name={offline ? "wifi" : "users"} size={26} /></div><h3 className="mt-4 font-bold text-slate-800">{offline ? "AI belum tersedia" : "Belum ada peserta"}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{offline ? "Pemantauan video tetap berjalan. Indikasi otomatis akan kembali setelah layanan AI tersambung." : "Peserta yang bergabung ke ruang ujian akan tampil di sini."}</p>{offline && <Button variant="secondary" className="mt-5">Coba lagi</Button>}</div></div>;
}

function Silhouette() {
  return <svg viewBox="0 0 40 40" aria-hidden="true" className="absolute bottom-0 left-1/2 h-4/5 -translate-x-1/2 text-white/70"><circle cx="20" cy="15" r="7" fill="currentColor" /><path d="M6 40c0-9 6-14 14-14s14 5 14 14z" fill="currentColor" /></svg>;
}

function Monitoring({ go }: { go: (s: Screen) => void }) {
  const [view, setView] = useState<"active" | "empty" | "loading" | "offline">("active");
  const [filter, setFilter] = useState("Semua");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState(true);
  const [room, setRoom] = useState(false);
  const live = useDetections();
  const attention = students.filter((s) => s.count > 0).length;
  const list = students.filter((s) => (filter === "Semua" || (filter === "Perlu perhatian" && s.count > 0) || (filter === "Normal" && s.count === 0 && s.status === "Hadir") || (filter === "Masalah koneksi" && s.status !== "Hadir")) && s.name.toLowerCase().includes(query.toLowerCase()));
  const stats: [string, string, IconName, string][] = [["Total siswa", "32", "users", "Semua terdaftar"], ["Sedang online", "31", "wifi", "97% terhubung"], ["Perlu perhatian", String(attention), "bell", "2 baru"], ["Indikasi tercatat", String(live ? live.length : 7), "report", "+3 jam ini"]];
  const ctl = (icon: IconName, off: boolean) => <span className={`grid size-6 place-items-center rounded text-white ${off ? "bg-red-600" : "bg-slate-900/70"}`}><Icon name={icon} size={13} /></span>;
  const feed: [string, string, string, boolean][] = [...(live ? live.map((d): [string, string, string, boolean] => [d.indicator, d.studentName, d.start, true]) : indications.map((i): [string, string, string, boolean] => [i.type, i.name, i.time, true])), ["Koneksi terputus", "Hana Maharani", "09.40.12", false]];
  return <AppShell active="monitor" go={go} title="Pemantauan Langsung"><main className="p-4 sm:p-8">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-semibold text-slate-900">Pemantauan siswa</h1><p className="mt-1 text-sm text-slate-500">XI IPA 2 · Matematika · 24 Mei 2025</p></div><Button variant="secondary" onClick={() => setRoom(!room)}>{room ? "Tutup ruang ujian" : "Buka ruang ujian"}</Button><div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5"><span className="size-2.5 animate-pulse rounded-full bg-red-500" /><div><p className="text-sm font-semibold text-slate-900">Ujian Akhir Matematika XI</p><p className="text-xs text-slate-500">Berlangsung · sisa 01:18:42</p></div></div></div>
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, icon, note]) => <div key={label} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"><div className="grid size-11 place-items-center rounded-lg bg-blue-50 text-blue-700"><Icon name={icon} size={21} /></div><div className="min-w-0 flex-1"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-semibold leading-8 text-slate-900">{value}</p></div><span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">{note}</span></div>)}</div>
    {room && <div className="mb-6 h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-slate-900"><OpenViduFrame role="moderator" className="size-full" fallback={<p className="p-8 text-sm text-slate-300">Ruang ujian belum tersambung. Jalankan server dan OpenVidu Meet.</p>} /></div>}
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <section>
        <div className="mb-4 flex flex-wrap items-center gap-3"><div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-200/70 p-1">{["Semua", "Normal", "Perlu perhatian", "Masalah koneksi"].map((t) => <button key={t} onClick={() => setFilter(t)} className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${filter === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}>{t}{t === "Perlu perhatian" && <span className="rounded-full bg-amber-100 px-1.5 text-[11px] text-amber-700">{attention}</span>}</button>)}</div>
          <select aria-label="Tampilan contoh" value={view} onChange={(e) => setView(e.target.value as typeof view)} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600"><option value="active">Langsung</option><option value="loading">Memuat</option><option value="empty">Kosong</option><option value="offline">AI belum tersedia</option></select>
          <div className="relative ml-auto min-w-52 flex-1 sm:max-w-xs"><span className="absolute left-3 top-2.5 text-slate-400"><Icon name="search" size={17} /></span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama siswa" className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500" /></div></div>
        {view !== "active" ? <div className="flex min-h-[420px] rounded-lg border border-slate-200 bg-white"><MonitorState state={view} /></div> : list.length === 0 ? <div className="rounded-lg border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Tidak ada siswa yang cocok dengan filter ini.</div> : <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{list.map((s, i) => {
          const off = s.status === "Kamera mati" || s.status === "Terputus";
          const flag = indications.find((x) => x.name === s.name)?.type ?? "Perlu ditinjau";
          return <article key={s.name} className={`overflow-hidden rounded-lg border bg-white ${s.count ? "border-amber-300" : "border-slate-200"}`}>
            <div className={`relative aspect-video ${off ? "bg-slate-800" : ["bg-blue-100", "bg-slate-200", "bg-blue-50", "bg-slate-300"][i % 4]}`}>
              {off ? <div className="absolute inset-0 grid place-items-center text-center text-slate-300"><div><Icon name="wifi" size={22} /><p className="mt-1 text-xs">{s.status === "Terputus" ? "Menyambung ulang" : "Kamera dimatikan"}</p></div></div> : <Silhouette />}
              <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-slate-900/75 px-2 py-0.5 text-[11px] font-medium text-white"><span className="size-1.5 rounded-full bg-red-500" />LIVE</span>
              <div className="absolute right-2 top-2 flex gap-1">{ctl("mic", s.status === "Mikrofon mati")}{ctl("camera", s.status === "Kamera mati")}{ctl("wifi", s.status === "Terputus")}</div>
              {s.count > 0 && <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-amber-600/95 px-3 py-1.5 text-xs font-semibold text-white"><Icon name="bell" size={14} />{flag}</div>}
            </div>
            <div className="p-3.5"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{s.name}</p><p className="text-xs text-slate-400">NIS 23010{34 + students.indexOf(s)}</p></div><Badge tone={s.count ? "amber" : s.status === "Hadir" ? "green" : "gray"}>{s.count ? `${s.count} perlu ditinjau` : s.status === "Hadir" ? "Normal" : s.status}</Badge></div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><button onClick={() => setExpanded(s.name)} className="font-semibold text-slate-600 hover:text-slate-900">Perbesar</button><button onClick={() => go("student-detail")} className="flex items-center gap-1 font-semibold text-blue-700">Buka pemantauan <Icon name="chevron" size={14} /></button></div></div>
          </article>;
        })}</div>}
      </section>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><h2 className="font-semibold text-slate-900">Aktivitas terbaru</h2><p className="text-xs text-slate-500">Diperbarui langsung</p></div><button onClick={() => go("indications")} className="text-xs font-semibold text-blue-700">Lihat semua</button></div>
        <div className="divide-y divide-slate-100">{view === "offline" ? <p className="p-5 text-sm text-amber-800">AI belum tersedia. Daftar indikasi akan terisi lagi setelah layanan tersambung.</p> : feed.map(([title, who, time, ai]) => <button key={title + who} onClick={() => go(ai ? "detail" : "monitor")} className="flex w-full items-start gap-3 p-4 text-left hover:bg-slate-50"><span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-md ${ai ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}><Icon name={ai ? "bell" : "wifi"} size={16} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-800">{title}</span><span className="text-xs text-slate-500">{who} · {time}</span></span>{ai && <span className="mt-2 size-2 rounded-full bg-blue-600" />}</button>)}</div>
        <div className="m-4 flex gap-3 rounded-md bg-blue-50 p-3.5 text-xs leading-5 text-blue-900"><Icon name="shield" size={17} /><p><strong className="block font-semibold">Perlu verifikasi manusia</strong>Indikasi dari AI hanya membantu peninjauan dan tidak menentukan hasil secara otomatis.</p></div>
      </aside>
    </div>
    {expanded && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-6"><section role="dialog" aria-modal="true" className="w-full max-w-4xl overflow-hidden rounded-lg border border-slate-700 bg-slate-900"><div className="flex items-center justify-between border-b border-white/10 p-4 text-white"><div><p className="font-semibold">{expanded}</p><p className="text-xs text-slate-400">Siaran langsung · koneksi baik</p></div><button onClick={() => setExpanded(null)} aria-label="Tutup"><Icon name="close" /></button></div><div className="relative aspect-video bg-slate-800"><Silhouette /></div><div className="flex justify-end gap-2 border-t border-white/10 p-4"><Button variant="secondary" onClick={() => { setExpanded(null); go("student-detail"); }}>Detail siswa</Button><Button onClick={() => setExpanded(null)}>Tutup</Button></div></section></div>}
    {toast && view === "active" && <div role="status" className="fixed right-6 top-20 z-40 w-80 rounded-lg border border-amber-300 bg-white p-4 shadow-lg"><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-amber-50 text-amber-600"><Icon name="bell" size={16} /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">Indikasi baru</p><p className="text-xs text-slate-500">Farah Nabila · Wajah tidak terdeteksi</p><div className="mt-3 flex gap-4 text-xs font-semibold"><button onClick={() => go("detail")} className="text-blue-700">Tinjau</button><button onClick={() => setToast(false)} className="text-slate-500">Tutup</button></div></div></div></div>}
  </main></AppShell>;
}

function StudentMonitoringDetail({ go }: { go: (s: Screen) => void }) {
  return <AppShell active="student-detail" go={go} title="Detail Pemantauan Siswa"><main className="p-4 sm:p-8">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><button onClick={() => go("monitor")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"><Icon name="arrow" size={18} />Kembali ke pemantauan</button><Button variant="secondary" onClick={() => go("timeline")}>Lihat linimasa lengkap</Button></div>
    <div className="mb-6 flex flex-col justify-between gap-5 rounded-md border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><div className="grid size-14 place-items-center rounded-full bg-amber-100 font-bold text-amber-800">BP</div><div><div className="flex items-center gap-2"><h1 className="text-xl font-bold text-slate-900">Bima Pratama</h1><Badge tone="amber">Perlu perhatian</Badge></div><p className="mt-1 text-sm text-slate-500">NIS 2301035 • XI IPA 2</p></div></div><div className="flex gap-5 text-center"><div><p className="text-sm font-bold text-emerald-600">Stabil</p><p className="text-[10px] text-slate-400">Koneksi</p></div><div><p className="text-sm font-bold text-slate-700">Aktif</p><p className="text-[10px] text-slate-400">Kamera</p></div><div><p className="text-sm font-bold text-slate-700">Aktif</p><p className="text-[10px] text-slate-400">Mikrofon</p></div></div></div>
    <div className="grid gap-6 xl:grid-cols-[1.45fr_.8fr]"><div className="space-y-6"><section className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="relative flex aspect-video items-center justify-center bg-slate-800"><div className="grid size-24 place-items-center rounded-full bg-white/10 text-2xl font-bold text-white ring-1 ring-white/20">BP</div><div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-md bg-slate-900/70 px-3 py-2 text-xs text-white"><span className="size-2 rounded-full bg-emerald-400" />Siaran langsung • OpenVidu</div></div><div className="flex items-center justify-between p-4"><p className="text-sm font-semibold text-slate-700">Ujian Akhir Matematika XI</p><div className="flex gap-2 text-slate-500"><Icon name="mic" size={17} /><Icon name="camera" size={17} /><Icon name="wifi" size={17} /></div></div></section>
      <section className="rounded-md border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Aktivitas Siswa</h2><p className="mt-1 text-xs text-slate-500">Linimasa perangkat dan Indikasi selama sesi.</p></div><Badge tone="amber">2 belum ditinjau</Badge></div><div className="mt-5 divide-y divide-slate-100">{[["08:05:12","Siswa masuk room","green"],["08:15:20","Indikasi terdeteksi","amber"],["08:20:45","Kamera aktif","green"],["08:35:10","Indikasi terdeteksi","amber"]].map(([time,event,tone]) => <div key={time} className="flex items-center gap-4 py-3"><span className={`size-2 rounded-full ${tone === "amber" ? "bg-amber-500" : "bg-emerald-500"}`} /><span className="w-20 text-xs font-semibold text-slate-500">{time}</span><p className="flex-1 text-sm font-semibold text-slate-800">{event}</p>{tone === "amber" && <button onClick={() => go("detail")} className="text-xs font-bold text-blue-700">Lihat Evidence</button>}</div>)}</div><div className="mt-5 flex gap-3 border-t border-slate-100 pt-5"><Button onClick={() => go("indications")}>Lihat Indikasi</Button><Button variant="secondary" onClick={() => go("detail")}>Lihat Evidence</Button></div></section></div>
      <aside className="space-y-6"><section className="rounded-md border border-slate-200 bg-white p-5"><h2 className="font-bold text-slate-900">Status pemantauan</h2><div className="mt-5 space-y-4">{[["Status kehadiran","Hadir"],["Waktu masuk","07.56.18"],["Koneksi","24 ms • Stabil"],["Kamera","Aktif"],["Mikrofon","Aktif"],["Jumlah Indikasi","4 kejadian"],["Belum ditinjau","2 Indikasi"]].map(([k,v],i) => <div key={k} className="flex justify-between gap-4 text-sm"><span className="text-slate-500">{k}</span><span className={`text-right font-semibold ${i === 0 ? "text-emerald-700" : i === 6 ? "text-amber-700" : "text-slate-800"}`}>{v}</span></div>)}</div></section><section className="rounded-md border border-blue-100 bg-blue-50 p-5"><div className="flex gap-3"><span className="text-blue-700"><Icon name="shield" size={19} /></span><div><p className="text-sm font-bold text-blue-900">Keputusan tetap pada pengawas</p><p className="mt-2 text-xs leading-5 text-blue-800">Periksa rekaman dan konteks sebelum membuat penilaian.</p></div></div></section></aside></div>
  </main></AppShell>;
}

function MonitoringTimeline({ go }: { go: (s: Screen) => void }) {
  const events = [["09.01","Siswa bergabung ke ruang ujian","Koneksi","green"],["09.05","Kamera dan mikrofon terhubung","Perangkat","green"],["09.27","Wajah tidak terlihat selama 6 detik","Indikasi","amber"],["09.31","Aktivitas kembali normal","Aktivitas","gray"],["09.42","Gerakan berulang terdeteksi","Indikasi","amber"],["09.45","Indikasi ditinjau oleh Rina Setiawati","Tinjauan pengawas","blue"]];
  return <AppShell active="timeline" go={go} title="Linimasa Pemantauan"><main className="mx-auto max-w-5xl p-4 sm:p-8"><button onClick={() => go("student-detail")} className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500"><Icon name="arrow" size={18} />Kembali ke detail siswa</button><PageTitle title="Linimasa Pemantauan" description="Bima Pratama • Ujian Akhir Matematika XI" />
    <div className="mb-6 flex flex-wrap gap-2 rounded-md border border-slate-200 bg-white p-4"><select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600"><option>Semua siswa</option><option>Bima Pratama</option></select><select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600"><option>Semua jenis kejadian</option><option>Indikasi</option><option>Perangkat</option></select><select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600"><option>Semua tingkat</option><option>Perlu perhatian</option><option>Informasi</option></select><Field label="" type="time" /></div>
    <section className="rounded-md border border-slate-200 bg-white p-6"><div className="relative ml-3 border-l border-slate-200 pl-8">{events.map(([time,title,type,tone],i) => <div key={time+title} className={`${i < events.length - 1 ? "pb-8" : ""} relative`}><span className={`absolute -left-[39px] top-1 grid size-5 place-items-center rounded-full ring-4 ring-white ${tone === "amber" ? "bg-amber-500" : tone === "green" ? "bg-emerald-500" : tone === "blue" ? "bg-blue-500" : "bg-slate-400"}`} /><div className="flex flex-col justify-between gap-2 sm:flex-row"><div><p className="text-sm font-bold text-slate-800">{title}</p><p className="mt-1 text-xs text-slate-500">{type} • Bima Pratama</p></div><span className="text-xs font-semibold text-slate-400">{time} WIB</span></div></div>)}</div></section>
  </main></AppShell>;
}

function IndicationDetail({ go }: { go: (s: Screen) => void }) {
  const [choice, setChoice] = useState("Valid");
  const { role } = useRole();
  const readOnly = role === "Pihak Sekolah";
  return <AppShell active="detail" go={go} title="Detail Indikasi"><main className="mx-auto max-w-6xl p-4 sm:p-8">
    <button onClick={() => go("monitor")} className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"><Icon name="arrow" size={18} />Kembali ke pemantauan</button><PageTitle eyebrow="Indikasi #IND-0241" title="Wajah tidak terdeteksi" description="Tinjau bukti dan tentukan hasil validasi sebagai pengawas." />
    <div className="grid gap-6 lg:grid-cols-[1.5fr_.8fr]"><div className="space-y-6"><section className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="relative flex aspect-video items-center justify-center bg-slate-900"><div className="text-center text-slate-400"><div className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 text-white"><Icon name="video" size={26} /></div><p className="mt-3 text-sm">Video evidence 00:18</p></div><div className="absolute right-4 top-4 flex gap-2"><span className="rounded-md bg-slate-950/70 px-2.5 py-1.5 text-[10px] font-semibold text-white">Snapshot tersedia</span><span className="rounded-md bg-slate-950/70 px-2.5 py-1.5 text-[10px] font-semibold text-white">Audio tersedia</span></div><button className="absolute bottom-5 left-5 grid size-10 place-items-center rounded-full bg-white text-slate-900" aria-label="Putar atau jeda"><span className="ml-0.5">▶</span></button><div className="absolute bottom-5 right-5 flex gap-2 text-white"><button className="grid size-9 place-items-center rounded-md bg-white/10" aria-label="Atur volume"><Icon name="mic" size={17} /></button><button onClick={() => notify("Layar penuh: tersedia setelah backend terhubung.")} className="rounded-md bg-white/10 px-3 text-xs font-semibold">Layar penuh</button></div></div><div className="p-5"><div className="relative h-2 rounded-full bg-slate-200"><div className="h-2 w-[56%] rounded-full bg-blue-700" /><span className="absolute left-[42%] top-1/2 h-5 w-0.5 -translate-y-1/2 bg-amber-500" /><span className="absolute left-[42%] top-4 -translate-x-1/2 text-[10px] font-semibold text-amber-700">Indikasi</span></div><div className="mt-8 flex justify-between text-xs text-slate-400"><span>09.42.10</span><span>09.42.28</span></div></div></section>
      <section className="rounded-md border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">{readOnly ? "Validasi Pengawas" : "Hasil tinjauan"}</h2><p className="mt-1 text-sm text-slate-500">{readOnly ? "Hasil ini hanya dapat dilihat dan tidak dapat diubah oleh pihak sekolah." : "Pilih keputusan berdasarkan bukti yang tersedia."}</p>{readOnly ? <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-5"><Badge tone="green">Valid</Badge><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Validator</dt><dd className="font-semibold text-slate-800">Rina Setiawati</dd></div><div className="flex justify-between"><dt className="text-slate-500">Waktu validasi</dt><dd className="font-semibold text-slate-800">24 Mei 2025, 10.12</dd></div></dl><p className="mt-4 border-t border-emerald-200 pt-4 text-sm leading-6 text-emerald-900">Peserta meninggalkan area kamera selama kejadian berlangsung.</p></div> : <><div className="mt-5 grid gap-3 sm:grid-cols-3">{[["Valid","green"],["Tidak valid","gray"],["Perlu tinjauan lanjut","amber"]].map(([label, tone]) => <button key={label} onClick={() => setChoice(label)} className={`rounded-md border p-4 text-left transition ${choice === label ? tone === "green" ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100" : tone === "amber" ? "border-amber-500 bg-amber-50 ring-2 ring-amber-100" : "border-slate-500 bg-slate-50 ring-2 ring-slate-100" : "border-slate-200 hover:bg-slate-50"}`}><span className="block text-sm font-bold text-slate-800">{label}</span><span className="mt-1 block text-xs text-slate-500">{label === "Valid" ? "Bukti mendukung Indikasi" : label === "Tidak valid" ? "Bukti tidak mendukung" : "Perlu pemeriksaan tambahan"}</span></button>)}</div><label className="mt-5 block"><span className="mb-2 block text-sm font-semibold text-slate-700">Catatan pengawas</span><textarea rows={4} placeholder="Tambahkan alasan atau catatan pendukung..." className="w-full resize-none rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" /></label><div className="mt-4 flex justify-end"><Button onClick={() => go("monitor")}>Simpan Validasi</Button></div></>}</section></div>
      <aside className="h-fit rounded-md border border-slate-200 bg-white p-6"><div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="grid size-11 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">FN</div><div><p className="font-bold text-slate-900">Farah Nabila</p><p className="text-xs text-slate-500">NIS 120038 • Kelas XII-A</p></div></div><dl className="mt-5 space-y-4 text-sm">{[["Jenis Indikasi","Wajah tidak terdeteksi"],["Waktu mulai","09.42.10"],["Waktu selesai","09.42.28"],["Durasi","18 detik"],["Tingkat keyakinan","Tinggi (89%)"]].map(([k,v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-slate-500">{k}</dt><dd className="text-right font-semibold text-slate-800">{v}</dd></div>)}</dl><div className="mt-6 rounded-md bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-700">Alasan Indikasi</p><p className="mt-2 text-sm leading-6 text-amber-900">Wajah peserta tidak terlihat di area kamera selama 18 detik berturut-turut.</p></div><div className="mt-4 rounded-md bg-blue-50 p-4"><div className="flex gap-2 text-xs leading-5 text-blue-800"><span className="mt-0.5"><Icon name="bell" size={15} /></span>AI hanya memberi Indikasi. Keputusan akhir berada pada pengawas.</div></div></aside>
    </div>
  </main></AppShell>;
}

function SupervisorEvidenceDetail({ go }: { go: (s: Screen) => void }) {
  const { role } = useRole();
  const readOnly = role === "Pihak Sekolah";
  const [choice, setChoice] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [manualSaved, setManualSaved] = useState(false);
  const [manualNote, setManualNote] = useState("");
  const [history, setHistory] = useState([["10:25","Rina Setiawati","Valid","Wajah tidak terlihat selama kejadian."]]);
  const saveValidation = () => {
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    setHistory((current) => [...current, [time, "Rina Setiawati", choice, note || "Tidak ada catatan tambahan."]]);
    setSaved(true);
  };
  return <AppShell active="detail" go={go} title="Detail Evidence"><main className="mx-auto max-w-6xl p-4 sm:p-8">
    <button onClick={() => go("indications")} className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"><Icon name="arrow" size={18} />Kembali ke Indikasi</button>
    <PageTitle eyebrow="Indikasi #IND-0241" title="Detail Evidence" description="Evidence terkait Indikasi pada waktu kejadian." />
    <div className="grid gap-6 xl:grid-cols-[1.45fr_.75fr]"><div className="space-y-6">
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="relative grid aspect-video place-items-center bg-slate-900"><div className="text-center text-slate-300"><div className="mx-auto grid size-16 place-items-center rounded-full bg-white/10 text-white"><Icon name="video" size={26} /></div><p className="mt-3 text-sm">{playing ? "Evidence sedang diputar" : "Video evidence • 18 detik"}</p></div><button onClick={() => setPlaying(!playing)} className="absolute bottom-5 left-5 grid size-10 place-items-center rounded-full bg-white text-slate-900" aria-label={playing ? "Pause" : "Play"}>{playing ? "Ⅱ" : "▶"}</button><div className="absolute bottom-5 right-5 flex gap-2 text-white"><button onClick={() => notify("Volume aktif setelah evidence tersambung.")} className="grid size-9 place-items-center rounded-md bg-white/10" aria-label="Volume"><Icon name="mic" size={17} /></button><button onClick={(e) => e.currentTarget.closest("section")?.requestFullscreen?.()} className="rounded-md bg-white/10 px-3 text-xs font-semibold">Fullscreen</button></div><span className="absolute right-4 top-4 rounded-md bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-white">Snapshot tersedia</span></div><div className="p-5"><div className="relative h-2 rounded-full bg-slate-200"><div className="h-2 w-[56%] rounded-full bg-blue-700" /><span className="absolute left-[42%] top-1/2 h-5 w-0.5 -translate-y-1/2 bg-amber-500" /></div><div className="mt-5 flex items-center justify-between"><span className="text-xs text-slate-500">09.42.10 — 09.42.28</span><div className="flex gap-2"><Button variant="secondary" className="h-9" onClick={() => setPlaying(true)}>Putar Evidence</Button><Button variant="ghost" className="h-9">Lihat Rekaman Penuh</Button></div></div></div></section>
      <section className="rounded-md border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Validasi Pengawas</h2><p className="mt-1 text-sm text-slate-500">Pilih hasil berdasarkan evidence dan konteks kejadian.</p>{!readOnly && <><div className="mt-5 grid gap-3 sm:grid-cols-3">{["Valid","Tidak Valid","Perlu Tinjauan Lanjut"].map((label) => <button key={label} onClick={() => setChoice(label)} className={`rounded-md border p-4 text-left ${choice === label ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 hover:bg-slate-50"}`}><span className="text-sm font-bold text-slate-800">{label}</span></button>)}</div><label className="mt-5 block"><span className="mb-2 block text-sm font-semibold text-slate-700">Catatan Pengawas</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} className="w-full resize-none rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-500" placeholder="Tuliskan alasan dan konteks validasi..." /></label><div className="mt-4 flex justify-end"><Button disabled={!choice || (choice !== "Tidak Valid" && !note.trim())} onClick={saveValidation}>Simpan Validasi</Button></div></>}{saved && <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center justify-between"><p className="text-sm font-bold text-emerald-900">Validasi berhasil disimpan</p><Badge tone="green">{choice}</Badge></div><p className="mt-2 text-xs text-emerald-800">Rina Setiawati • baru saja • {note || "Tidak ada catatan tambahan."}</p></div>}<div className="mt-6 border-t border-slate-100 pt-6"><h3 className="text-sm font-bold text-slate-900">Riwayat Validasi</h3><div className="mt-3 divide-y divide-slate-100">{history.map((item,index) => <div key={`${item[0]}-${index}`} className="grid gap-2 py-3 text-sm sm:grid-cols-[70px_1fr_180px]"><span className="text-slate-500">{item[0]}</span><div><p className="font-semibold text-slate-800">{item[1]}</p><p className="mt-1 text-xs text-slate-500">{item[3]}</p></div><Badge tone={item[2] === "Valid" ? "green" : "amber"}>{item[2]}</Badge></div>)}</div></div></section>
      {!readOnly && <section className="rounded-md border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Tambah Catatan Manual</h2><p className="mt-1 text-sm text-slate-500">Catat kejadian yang terlihat langsung tetapi tidak terdeteksi sistem.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Waktu Kejadian" type="time" value="09:48" /><Field label="Jenis Kejadian" placeholder="Contoh: Aktivitas di luar kamera" /><label className="block sm:col-span-2"><span className="mb-2 block text-sm font-semibold text-slate-700">Catatan</span><textarea rows={3} value={manualNote} onChange={(e) => { setManualNote(e.target.value); setManualSaved(false); }} className="w-full rounded-md border border-slate-200 p-3 text-sm" placeholder="Jelaskan kejadian yang diamati..." /></label></div><div className="mt-4 flex items-center justify-between">{manualSaved ? <span className="text-xs font-semibold text-emerald-700">Catatan manual berhasil disimpan.</span> : <span />}<Button variant="secondary" disabled={!manualNote.trim()} onClick={() => { setManualSaved(true); setManualNote(""); }}>Simpan Catatan</Button></div></section>}
    </div><aside className="h-fit rounded-md border border-slate-200 bg-white p-6"><div className="flex items-center gap-3 border-b border-slate-100 pb-5"><div className="grid size-11 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">FN</div><div><p className="font-bold text-slate-900">Farah Nabila</p><p className="text-xs text-slate-500">NIS 2301038 • XI IPA 2</p></div></div><dl className="mt-5 space-y-4 text-sm">{[["Jenis Indikasi","Wajah tidak terdeteksi"],["Waktu kejadian","09.42.10"],["Durasi","18 detik"],["Confidence / Score","89% • Tinggi"],["Status validasi",history.at(-1)?.[2] || "Belum Ditinjau"]].map(([label,value]) => <div key={label} className="flex justify-between gap-4"><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold text-slate-800">{value}</dd></div>)}</dl><div className="mt-6 rounded-md bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-700">Timeline kejadian</p><p className="mt-2 text-sm leading-6 text-amber-900">09.42.10 wajah keluar bingkai, 09.42.28 wajah kembali terdeteksi.</p></div></aside></div>
  </main></AppShell>;
}

function Report({ go }: { go: (s: Screen) => void }) {
  const [confirm, setConfirm] = useState(false);
  const [exportType, setExportType] = useState<"PDF" | "Excel" | null>(null);
  const [toast, setToast] = useState("");
  return <AppShell active="report" go={go} title="Laporan Sesi"><main className="p-4 sm:p-8">
    <PageTitle eyebrow="Sesi selesai" title="Laporan Sesi" description="Ujian Akhir Matematika XII • 24 Mei 2025, 08.00–10.00" action={<div className="flex flex-wrap gap-2"><Button variant="secondary" icon="download" onClick={() => setExportType("PDF")}>Export PDF</Button><Button variant="secondary" icon="download" onClick={() => setExportType("Excel")}>Export Excel</Button><Button onClick={() => setConfirm(true)}>Finalisasi Laporan</Button></div>} />
    <div className="mb-5 grid gap-4 xl:grid-cols-3"><section className="rounded-md border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Informasi Sesi</p><div className="mt-4 space-y-2 text-sm">{[["Nama","Ujian Akhir Matematika XII"],["Tanggal","24 Mei 2025"],["Jam","08.00–10.00 WIB"],["Durasi","120 menit"],["Pengawas","Rina Setiawati"]].map(([k,v]) => <div key={k} className="flex justify-between gap-4"><span className="text-slate-500">{k}</span><span className="text-right font-semibold text-slate-800">{v}</span></div>)}</div></section><section className="rounded-md border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Kehadiran</p><div className="mt-4 grid grid-cols-2 gap-4">{[["32","Total peserta"],["30","Hadir"],["1","Tidak hadir"],["1","Terputus"]].map(([value,label]) => <div key={label}><p className="text-xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>)}</div></section><section className="rounded-md border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Indikasi</p><div className="mt-4 grid grid-cols-2 gap-4">{[["12","Total"],["5","Valid"],["3","Tidak Valid"],["2","Perlu Tinjauan"]].map(([value,label]) => <div key={label}><p className="text-xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>)}</div></section></div>
    <div className="mb-5 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4"><span className="text-amber-600"><Icon name="bell" size={18} /></span><div><p className="text-sm font-bold text-amber-900">2 Indikasi belum ditinjau</p><p className="mt-1 text-xs leading-5 text-amber-800">Laporan final hanya akan memasukkan Indikasi yang telah melalui proses validasi.</p></div></div>
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white"><div className="flex min-w-[620px] divide-x divide-slate-200">{[["32 dari 32","Kehadiran","green"],["12","Total Indikasi","amber"],["10","Sudah ditinjau","blue"],["2","Belum ditinjau","gray"]].map(([num,label,tone]) => <div key={label} className="flex flex-1 items-center gap-3 px-4 py-3"><span className={`size-2 rounded-full ${tone === "green" ? "bg-emerald-500" : tone === "amber" ? "bg-amber-500" : tone === "blue" ? "bg-blue-700" : "bg-slate-400"}`} /><div><p className="text-lg font-bold leading-5 text-slate-900">{num}</p><p className="mt-0.5 whitespace-nowrap text-xs text-slate-500">{label}</p></div></div>)}</div></div>
    <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-bold text-slate-900">Rincian Indikasi</h2><p className="mt-1 text-xs text-slate-500">Status validasi, catatan pengawas, dan evidence.</p></div><Badge tone="amber">2 belum ditinjau</Badge></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5">Siswa</th><th className="px-5 py-3.5">Jenis Indikasi</th><th className="px-5 py-3.5">Waktu</th><th className="px-5 py-3.5">Status validasi</th><th className="px-5 py-3.5">Catatan Pengawas</th><th className="px-5 py-3.5">Evidence</th></tr></thead><tbody>{[["Farah Nabila","Wajah tidak terdeteksi","09.42.18","Valid","Peserta meninggalkan kursi."],["Bima Pratama","Menoleh berulang kali","09.39.04","Tidak Valid","Melihat jam dinding."],["Citra Lestari","Perangkat lain terlihat","09.31.22","Perlu Tinjauan Lanjut","Konfirmasi dengan wali kelas."],["Gilang Ramadhan","Suara lain terdeteksi","09.26.51","Valid","Terdengar percakapan lain."],["Nadia Salsabila","Wajah tidak terdeteksi","09.51.08","BELUM DITINJAU","—"]].map((r) => <tr key={r[0]+r[2]} className={`border-t border-slate-100 ${r[3] === "BELUM DITINJAU" ? "bg-amber-50/50" : ""}`}><td className="px-5 py-4 font-semibold text-slate-800">{r[0]}</td><td className="px-5 py-4 text-slate-600">{r[1]}</td><td className="px-5 py-4 text-slate-500">{r[2]}</td><td className="px-5 py-4"><Badge tone={r[3] === "Valid" ? "green" : r[3] === "Tidak Valid" ? "gray" : "amber"}>{r[3]}</Badge></td><td className="max-w-56 truncate px-5 py-4 text-slate-500">{r[4]}</td><td className="px-5 py-4"><button onClick={() => go("detail")} className="font-semibold text-blue-700 hover:underline">Lihat Evidence</button></td></tr>)}</tbody></table></div></section>
    <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-4"><div><h2 className="font-bold text-slate-900">Log koneksi peserta</h2><p className="mt-1 text-xs text-slate-500">Riwayat gangguan koneksi selama sesi.</p></div><Button variant="ghost">Lihat semua</Button></div><div className="divide-y divide-slate-100">{[["Hana Maharani","Terputus selama 2 menit","09.18–09.20"],["Raka Aditya","Koneksi tidak stabil","09.33–09.35"],["Nadia Salsabila","Terhubung kembali","09.51"]].map((x) => <div key={x[0]} className="flex items-center gap-3 px-4 py-3"><span className="text-slate-400"><Icon name="wifi" size={16} /></span><p className="min-w-40 text-sm font-semibold text-slate-800">{x[0]}</p><p className="flex-1 text-xs text-slate-500">{x[1]}</p><p className="text-[11px] font-semibold text-slate-400">{x[2]}</p></div>)}</div></section>
    <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="font-bold text-slate-900">Aktivitas Pengawas</h2><p className="mt-1 text-xs text-slate-500">Audit log hanya-baca dan tidak dapat diedit atau dihapus.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Aktivitas</th><th className="px-5 py-3">Waktu</th><th className="px-5 py-3">User</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{[["Membuka evidence","09.45","Rina Setiawati"],["Melakukan validasi","09.48","Rina Setiawati"],["Mengubah validasi","10.02","Rina Setiawati"],["Export laporan","10.18","Rina Setiawati"]].map((row) => <tr key={row[0]} className="border-t border-slate-100"><td className="px-5 py-4 font-semibold text-slate-800">{row[0]}</td><td className="px-5 py-4 text-slate-500">{row[1]}</td><td className="px-5 py-4 text-slate-600">{row[2]}</td><td className="px-5 py-4"><Badge tone="green">Berhasil</Badge></td></tr>)}</tbody></table></div></section>
    {confirm && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6"><div className="grid size-11 place-items-center rounded-md bg-amber-50 text-amber-700"><Icon name="report" /></div><h2 className="mt-5 text-lg font-bold text-slate-900">Finalisasi laporan?</h2><p className="mt-2 text-sm leading-6 text-slate-500">Masih ada 2 Indikasi yang belum ditinjau. Tinjau seluruh Indikasi sebelum membuat laporan final.</p><div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={() => setConfirm(false)}>Batal</Button><Button onClick={() => { setConfirm(false); setToast("Laporan disimpan sebagai draf."); }}>Simpan sebagai draf</Button></div></section></div>}
    {exportType && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6"><div className="grid size-11 place-items-center rounded-md bg-blue-50 text-blue-700"><Icon name="download" /></div><h2 className="mt-5 text-lg font-bold text-slate-900">Export Laporan {exportType}</h2><p className="mt-2 text-sm leading-6 text-slate-500">Apakah Anda yakin ingin mengekspor laporan sesi ini?</p><div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={() => setExportType(null)}>Batal</Button><Button onClick={() => { setExportType(null); setToast("Laporan berhasil diekspor."); }}>Ya, Export</Button></div></section></div>}
    {toast && <div role="status" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-md border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800"><Icon name="check" size={18} />{toast}<button onClick={() => setToast("")} className="ml-3 text-slate-400"><Icon name="close" size={16} /></button></div>}
  </main></AppShell>;
}

function StudentList({ go }: { go: (s: Screen) => void }) {
  const data = [["Alya Putri","2301034","Hadir","0","0"],["Bima Pratama","2301035","Hadir","4","2"],["Citra Lestari","2301036","Mikrofon Mati","1","1"],["Dimas Saputra","2301037","Hadir","0","0"],["Farah Nabila","2301038","Kamera Mati","3","2"],["Hana Maharani","2301040","Terputus","0","0"]];
  return <AppShell active="students" go={go} title="Daftar Siswa"><main className="p-4 sm:p-8"><PageTitle title="Daftar Siswa" description="Peserta pada Ujian Akhir Matematika XI yang ditugaskan kepada Anda." />
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 xl:flex-row xl:items-center"><div className="relative flex-1"><span className="absolute left-3 top-2.5 text-slate-400"><Icon name="search" size={17} /></span><input className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm" placeholder="Cari nama atau NIS/NISN" /></div><select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600"><option>Semua status</option><option>Hadir</option><option>Belum Hadir</option><option>Kamera Mati</option><option>Mikrofon Mati</option><option>Terputus</option></select><select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600"><option>Indikasi terbanyak</option><option>Indikasi tersedikit</option><option>Nama A–Z</option></select></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5">Nama Siswa</th><th className="px-5 py-3.5">NIS/NISN</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Jumlah Indikasi</th><th className="px-5 py-3.5">Belum Ditinjau</th><th className="px-5 py-3.5">Aksi</th></tr></thead><tbody>{data.map((r) => <tr key={r[1]} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{r[0].split(" ").map(x => x[0]).join("")}</div><span className="font-semibold text-slate-800">{r[0]}</span></div></td><td className="px-5 py-4 text-slate-500">{r[1]}</td><td className="px-5 py-4"><Badge tone={r[2] === "Hadir" ? "green" : "amber"}>{r[2]}</Badge></td><td className="px-5 py-4 font-semibold text-slate-700">{r[3]}</td><td className="px-5 py-4"><Badge tone={r[4] === "0" ? "gray" : "amber"}>{r[4]}</Badge></td><td className="px-5 py-4"><button onClick={() => go("student-detail")} className="text-xs font-semibold text-blue-700">Detail Siswa</button></td></tr>)}</tbody></table></div></section>
    <div className="mt-4 flex items-start gap-3 rounded-md bg-slate-100 p-4 text-xs leading-5 text-slate-600"><Icon name="shield" size={17} /><p>Hanya informasi akademik dan pemantauan yang relevan yang ditampilkan. Data pribadi lain tidak disimpan pada halaman ini.</p></div>
  </main></AppShell>;
}

function Settings({ go }: { go: (s: Screen) => void }) {
  const [section, setSection] = useState("Profil");
  const [dirty, setDirty] = useState(false);
  const [sw, setSw] = useState<Record<string, boolean>>({});
  const { role } = useRole();
  const menu = role === "Pengawas" ? ["Profil","Preferensi pemantauan","Notifikasi","Privasi","Keamanan akun"] : ["Profil","Keamanan akun"];
  return <AppShell active="settings" go={go} title="Pengaturan"><main className="mx-auto max-w-6xl p-4 sm:p-8"><PageTitle title="Pengaturan" description="Kelola preferensi akun, pemantauan, keamanan, dan privasi data." /><div className="grid gap-6 lg:grid-cols-[250px_1fr]"><aside className="h-fit rounded-md border border-slate-200 bg-white p-2">{menu.map(x => <button key={x} onClick={() => { setSection(x); setDirty(false); }} className={`w-full rounded-md px-3 py-2.5 text-left text-sm font-semibold ${section === x ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>{x}</button>)}</aside>
    <section onChange={() => setDirty(true)} className="rounded-md border border-slate-200 bg-white p-6"><div className="border-b border-slate-100 pb-5"><h2 className="font-bold text-slate-900">{section}</h2><p className="mt-1 text-sm text-slate-500">{section === "Privasi" ? "Atur akses dan penggunaan data pemantauan ujian." : `Kelola pengaturan ${section.toLowerCase()} Anda.`}</p></div>
      {section === "Profil" ? <div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Nama lengkap" value={role === "Siswa" ? "Alya Putri" : role === "Admin" ? "Nadia Aulia" : "Rina Setiawati"} /><Field label="Email institusi" value={role === "Siswa" ? "alya@sman8bdg.sch.id" : "rina@sman8bdg.sch.id"} /><Field label="Institusi" value="SMA Negeri 8 Bandung" /><Field label="Peran" value={role} /></div> : section === "Privasi" ? <div className="mt-6 space-y-4"><div className="rounded-md bg-blue-50 p-5"><div className="flex gap-3"><Icon name="shield" size={20} /><div><p className="text-sm font-bold text-blue-900">Data untuk pengawasan ujian</p><p className="mt-2 text-sm leading-6 text-blue-800">Rekaman video, audio, dan bukti Indikasi hanya digunakan untuk pengawasan, peninjauan, dan pelaporan ujian oleh pihak berwenang.</p></div></div></div></div> : <div className="mt-6 space-y-3">{["Pemberitahuan Indikasi baru","Peringatan masalah koneksi","Keamanan akun"].map((x,i) => <div key={x} className="flex items-center justify-between rounded-md border border-slate-200 p-4"><div><p className="text-sm font-semibold text-slate-800">{x}</p><p className="mt-1 text-xs text-slate-500">{i === 0 ? "Tampilkan notifikasi tanpa mengganggu pemantauan." : "Kirimkan informasi penting ke pengguna."}</p></div><Switch on={sw[x] ?? true} label={x} onChange={() => { setSw({ ...sw, [x]: !(sw[x] ?? true) }); setDirty(true); }} /></div>)}</div>}
      <div className="mt-6 flex justify-end"><Button disabled={!dirty} onClick={() => { document.querySelectorAll<HTMLInputElement>("input[data-k]").forEach((i) => localStorage.setItem("eduai_f_" + i.dataset.k, i.value)); setDirty(false); notify("Perubahan disimpan."); }}>Simpan perubahan</Button></div></section></div></main></AppShell>;
}

function StudentDashboard({ go }: { go: (s: Screen) => void }) {
  return <AppShell active="dashboard" go={go} title="Dasbor Siswa"><main className="p-4 sm:p-8">
    <PageTitle title="Selamat pagi, Alya" description="Lihat jadwal dan status ujian Anda di satu tempat." />
    <div className="grid gap-5 lg:grid-cols-3">{[
      ["Sedang berlangsung", "Ujian Akhir Matematika XI", "08.00–10.00 WIB", "blue"],
      ["Akan datang", "Evaluasi Bahasa Indonesia", "26 Mei 2025 • 09.30 WIB", "gray"],
      ["Selesai", "Ujian Tengah Semester Fisika", "21 Mei 2025 • 10.00 WIB", "green"],
    ].map(([status, title, time, tone]) => <section key={title} className="rounded-md border border-slate-200 bg-white p-5"><Badge tone={tone as "blue" | "gray" | "green"}>{status}</Badge><h2 className="mt-4 font-bold text-slate-900">{title}</h2><p className="mt-2 text-sm text-slate-500">{time}</p><p className="mt-1 text-xs text-slate-400">XI IPA 2 • SMA Negeri 8 Bandung</p>{status === "Sedang berlangsung" && <Button className="mt-5 w-full" onClick={() => go("device")}>Cek perangkat & masuk</Button>}</section>)}</div>
    <section className="mt-6 rounded-md border border-blue-100 bg-blue-50 p-5"><div className="flex gap-3"><Icon name="shield" size={20} /><div><p className="text-sm font-bold text-blue-900">Privasi peserta dilindungi</p><p className="mt-1 text-sm leading-6 text-blue-800">Siswa hanya dapat mengikuti ujian dan tidak memiliki akses ke video pemantauan, Indikasi, validasi, atau laporan final.</p></div></div></section>
  </main></AppShell>;
}

function MyExams({ go }: { go: (s: Screen) => void }) {
  const { createdExam } = useExam();
  const assignedCreated = createdExam?.students.some((student) => student.startsWith("Alya Putri")) ? [{ name: createdExam.name, date: createdExam.date, start: createdExam.start, duration: `${createdExam.duration} menit`, status: createdExam.status, timing: createdExam.status === "Sedang Berlangsung" ? "active" : createdExam.status === "Selesai" ? "ended" : "upcoming" }] : [];
  const rows = [...assignedCreated, { name: "Ujian Akhir Matematika XI", date: "24 Mei 2025", start: "08.00 WIB", duration: "120 menit", status: "Sedang Berlangsung", timing: "active" }, { name: "Evaluasi Bahasa Indonesia XI", date: "26 Mei 2025", start: "09.30 WIB", duration: "90 menit", status: "Belum dimulai", timing: "upcoming" }, { name: "Ujian Tengah Semester Fisika", date: "21 Mei 2025", start: "10.00 WIB", duration: "100 menit", status: "Selesai", timing: "ended" }];
  return <AppShell active="my-exams" go={go} title="Ujian Saya"><main className="p-4 sm:p-8"><PageTitle title="Ujian Saya" description="Hanya ujian yang didaftarkan Admin untuk Alya Putri • XI IPA 2." /><section className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5">Nama ujian</th><th className="px-5 py-3.5">Tanggal</th><th className="px-5 py-3.5">Jam mulai</th><th className="px-5 py-3.5">Durasi</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Aksi</th></tr></thead><tbody>{rows.map((row) => <tr key={row.name} className="border-t border-slate-100"><td className="px-5 py-4 font-semibold text-slate-800">{row.name}</td><td className="px-5 py-4 text-slate-600">{row.date}</td><td className="px-5 py-4 text-slate-600">{row.start}</td><td className="px-5 py-4 text-slate-600">{row.duration}</td><td className="px-5 py-4"><Badge tone={row.timing === "ended" ? "green" : row.timing === "active" ? "blue" : "gray"}>{row.status}</Badge></td><td className="px-5 py-4">{row.timing === "active" ? <Button className="h-9" onClick={() => go("device")}>Mulai Ujian</Button> : <div><Button onClick={() => go("consent")} className="h-9" disabled>Mulai Ujian</Button><p className="mt-1.5 text-[10px] text-slate-400">{row.timing === "upcoming" ? "Aktif saat jadwal dimulai" : "Waktu ujian telah berakhir"}</p></div>}</td></tr>)}</tbody></table></div><div className="border-t border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-800">Akses ujian divalidasi berdasarkan daftar peserta, tanggal, jam mulai, dan durasi yang ditentukan Admin.</div></section></main></AppShell>;
}

function InstitutionDashboard({ go, role }: { go: (s: Screen) => void; role: "Penyelenggara Ujian" | "Pihak Sekolah" }) {
  const organizer = role === "Penyelenggara Ujian";
  return <AppShell active="dashboard" go={go} title={`Dasbor ${role}`}><main className="p-4 sm:p-8"><PageTitle title={organizer ? "Koordinasi ujian semester" : "Ringkasan akademik sekolah"} description={organizer ? "Pantau sesi, peserta, pengawas, dan laporan sesuai kewenangan yang diberikan." : "Pantau informasi sesi dan laporan final yang telah melalui validasi."} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{(organizer ? [["6","Sesi terjadwal"],["184","Peserta"],["12","Pengawas"],["2","Sesi aktif"]] : [["24","Sesi semester ini"],["22","Laporan final"],["18","Indikasi tervalidasi"],["2","Laporan diproses"]]).map(([value,label]) => <section key={label} className="rounded-md border border-slate-200 bg-white p-5"><p className="text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></section>)}</div>
    <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-bold text-slate-900">{organizer ? "Sesi dalam kewenangan Anda" : "Laporan terbaru"}</h2><p className="mt-1 text-xs text-slate-500">Data SMA Negeri 8 Bandung • Semester genap</p></div><Button variant="ghost" onClick={() => go(organizer ? "sessions" : "report")}>Lihat semua</Button></div><div className="divide-y divide-slate-100">{sessions.slice(0,3).map((session) => <button key={session.name} onClick={() => go(organizer ? "exam-detail" : "report")} className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-slate-50"><div><p className="text-sm font-semibold text-slate-800">{session.name}</p><p className="mt-1 text-xs text-slate-500">{session.date} • {session.students} peserta</p></div><Badge tone={session.status === "Selesai" ? "green" : session.status === "Berlangsung" ? "blue" : "gray"}>{session.status}</Badge></button>)}</div></section>
  </main></AppShell>;
}

function AdminDashboard({ go }: { go: (s: Screen) => void }) {
  return <AppShell active="dashboard" go={go} title="Dasbor Admin"><main className="p-4 sm:p-8"><PageTitle title="Administrasi EduAI" description="Kelola ujian, akses, konfigurasi, retensi data, dan jejak aktivitas sistem." action={<Button icon="plus" onClick={() => go("create")}>Create Ujian</Button>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[["428","User aktif","users"],["3","Kebijakan retensi","clock"],["1.248","Audit hari ini","file"]].map(([value,label,icon]) => <button key={label} onClick={() => go(label === "User aktif" ? "users" : label === "Kebijakan retensi" ? "retention" : "audit")} className="rounded-md border border-slate-200 bg-white p-5 text-left hover:border-blue-200"><div className="flex items-center justify-between"><p className="text-2xl font-bold text-slate-900">{value}</p><span className="text-slate-400"><Icon name={icon as IconName} /></span></div><p className="mt-2 text-sm text-slate-500">{label}</p></button>)}</div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-md border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="font-bold text-slate-900">Aktivitas sistem terbaru</h2></div><div className="divide-y divide-slate-100">{[["Rina Setiawati","Melakukan validasi Indikasi","09.45"],["Sistem","Menghapus rekaman melewati masa simpan","08.10"],["Agus Wirawan","Export laporan Matematika XI","07.55"]].map((row) => <div key={row[0]+row[2]} className="flex items-center gap-4 p-4"><div className="grid size-9 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{row[0].slice(0,2).toUpperCase()}</div><div className="flex-1"><p className="text-sm font-semibold text-slate-800">{row[0]}</p><p className="mt-0.5 text-xs text-slate-500">{row[1]}</p></div><span className="text-xs text-slate-400">{row[2]}</span></div>)}</div></section><section className="rounded-md border border-blue-100 bg-blue-50 p-5"><h2 className="font-bold text-blue-900">Status sistem</h2><div className="mt-5 space-y-4">{[["Layanan pemantauan","Normal"],["Penyimpanan","68% terpakai"],["Penghapusan otomatis","Aktif"],["Audit log","Terlindungi"]].map(([label,value]) => <div key={label} className="flex justify-between text-sm"><span className="text-blue-800">{label}</span><span className="font-semibold text-blue-900">{value}</span></div>)}</div></section></div>
  </main></AppShell>;
}

function IndicationsPage({ go }: { go: (s: Screen) => void }) {
  const { role } = useRole();
  const readOnly = role === "Pihak Sekolah";
  const [filter, setFilter] = useState("Semua");
  const [sel, setSel] = useState(0);
  const rows = [["Farah Nabila", "Wajah tidak terdeteksi", "09.42.10", "09.42.28", "89%", "BELUM DITINJAU"], ["Bima Pratama", "Menoleh berulang kali", "09.39.04", "09.39.17", "76%", "Valid"], ["Gilang Ramadhan", "Suara lain terdeteksi", "09.36.51", "09.37.02", "71%", "Perlu Tinjauan Lanjut"], ["Citra Lestari", "Perangkat lain terlihat", "09.31.22", "09.31.29", "58%", "Tidak Valid"]];
  const visible = rows.filter((r) => (!readOnly || r[5] !== "BELUM DITINJAU") && (filter === "Semua" || r[5] === filter));
  const cur = visible[sel] ?? visible[0];
  const count = (l: string) => rows.filter((r) => r[5] === l).length;
  const tone = (l: string) => (l === "Valid" ? "green" : l === "BELUM DITINJAU" || l === "Perlu Tinjauan Lanjut" ? "amber" : "gray") as "green" | "amber" | "gray";
  const summary = [["Total indikasi", rows.length], ["Belum ditinjau", count("BELUM DITINJAU")], ["Valid", count("Valid")], ["Perlu tinjauan lanjut", count("Perlu Tinjauan Lanjut")]];
  return <AppShell active="indications" go={go} title="Daftar Indikasi"><main className="p-4 sm:p-8">
    <PageTitle title={readOnly ? "Indikasi Tervalidasi" : "Indikasi perilaku mencurigakan"} description={readOnly ? "Hanya hasil yang telah divalidasi ditampilkan untuk pihak sekolah." : "Pilih satu baris untuk melihat ringkasan, lalu buka evidence untuk memvalidasi."} />
    <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 xl:grid-cols-4">{summary.map(([l, n]) => <div key={l} className="bg-white px-5 py-4"><p className="text-2xl font-semibold text-slate-900">{n}</p><p className="text-xs text-slate-500">{l}</p></div>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">{["Semua", "BELUM DITINJAU", "Valid", "Tidak Valid", "Perlu Tinjauan Lanjut"].map((f) => <button key={f} onClick={() => { setFilter(f); setSel(0); }} className={`rounded-full border px-3 py-1 text-xs font-medium ${filter === f ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{f === "BELUM DITINJAU" ? "Belum ditinjau" : f}</button>)}</div>
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr><th className="px-5 py-3">Siswa</th><th className="px-5 py-3">Indikasi</th><th className="px-5 py-3">Waktu</th><th className="px-5 py-3">Skor</th><th className="px-5 py-3">Status</th></tr></thead><tbody>{visible.map((r, i) => <tr key={r[0] + r[2]} onClick={() => setSel(i)} className={`cursor-pointer border-t border-slate-100 ${cur === r ? "bg-blue-50" : ""}`}><td className="px-5 py-3.5 font-semibold text-slate-800">{r[0]}</td><td className="px-5 py-3.5 text-slate-600">{r[1]}</td><td className="px-5 py-3.5 text-slate-500">{r[2]}</td><td className="px-5 py-3.5 font-medium text-slate-700">{r[4]}</td><td className="px-5 py-3.5"><Badge tone={tone(r[5])}>{r[5] === "BELUM DITINJAU" ? "Belum ditinjau" : r[5]}</Badge></td></tr>)}</tbody></table></div>
        {visible.length === 0 && <p className="p-8 text-center text-sm text-slate-500">Tidak ada indikasi pada filter ini.</p>}
      </section>
      {cur && <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-semibold text-slate-900">{cur[0]}</h2><Badge tone={tone(cur[5])}>{cur[5] === "BELUM DITINJAU" ? "Belum ditinjau" : cur[5]}</Badge></div><p className="mt-1 text-sm text-slate-500">{cur[1]}</p>
        <div className="relative mt-4 grid aspect-video place-items-center overflow-hidden rounded-md bg-slate-800 text-xs text-slate-300"><Silhouette /><span className="absolute bottom-2 left-2 rounded bg-slate-900/70 px-2 py-0.5">Evidence {cur[2]}</span></div>
        <dl className="mt-4 space-y-3 text-sm">{[["Mulai", cur[2]], ["Selesai", cur[3]], ["Tingkat keyakinan", cur[4]]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-slate-500">{k}</dt><dd className="font-semibold text-slate-800">{v}</dd></div>)}</dl>
        <Button className="mt-5 w-full" onClick={() => go("detail")}>{readOnly ? "Lihat evidence" : "Buka evidence dan validasi"}</Button>
        <p className="mt-3 text-xs leading-5 text-slate-500">AI hanya memberi indikasi. Keputusan akhir ada pada pengawas.</p></aside>}
    </div>
  </main></AppShell>;
}

function HistoryPage({ go }: { go: (s: Screen) => void }) {
  const rows = [["Ujian Tengah Semester Fisika","21 Mei 2025","30","12","5","3","2","Final"],["Asesmen Sejarah Indonesia X","20 Mei 2025","34","8","4","3","1","Perlu Tinjauan"]];
  return <AppShell active="history" go={go} title="Riwayat Sesi"><main className="p-4 sm:p-8"><PageTitle title="Riwayat Sesi" description="Sesi selesai yang pernah ditugaskan kepada Rina Setiawati." /><section className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["Nama Ujian","Tanggal","Peserta","Indikasi","Valid","Tidak Valid","Perlu Tinjauan","Status Laporan","Aksi"].map((head) => <th key={head} className="px-5 py-3.5">{head}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]} className="border-t border-slate-100">{row.slice(0,7).map((cell,index) => <td key={`${cell}-${index}`} className={`px-5 py-4 ${index === 0 ? "font-semibold text-slate-800" : "text-slate-600"}`}>{cell}</td>)}<td className="px-5 py-4"><Badge tone={row[7] === "Final" ? "green" : "amber"}>{row[7]}</Badge></td><td className="px-5 py-4"><button onClick={() => go("report")} className="text-xs font-bold text-blue-700">Lihat Detail</button></td></tr>)}</tbody></table></div></section></main></AppShell>;
}

function UserManagement({ go }: { go: (s: Screen) => void }) {
  const { role } = useRole();
  const [modal, setModal] = useState(false);
  const [extra, setExtra] = useState<string[][]>([]);
  const admin = role === "Admin";
  const rows = admin ? [["Rina Setiawati","rina.s","Pengawas","Aktif","12 Jan 2025"],["Alya Putri","alya.p","Siswa","Aktif","8 Jul 2024"],["Dedi Kurniawan","dedi.k","Penyelenggara Ujian","Aktif","10 Jan 2025"],["Maya Sari","maya.s","Pihak Sekolah","Nonaktif","4 Agu 2024"]] : [["Rina Setiawati","Matematika","3 sesi aktif","Aktif","XI IPA 2"],["Agus Wirawan","Fisika","2 sesi aktif","Aktif","XI IPA 1"],["Nina Kartika","Bahasa Indonesia","1 sesi aktif","Aktif","XI IPS 1"]];
  return <AppShell active="users" go={go} title={admin ? "Manajemen User" : "Daftar Pengawas"}><main className="p-4 sm:p-8"><PageTitle title={admin ? "Manajemen User" : "Pengawas Ujian"} description={admin ? "Kelola akun, status, dan role pengguna EduAI." : "Tentukan pengawas untuk sesi yang menjadi kewenangan Anda."} action={<Button icon="plus" onClick={() => setModal(true)}>{admin ? "Tambah User" : "Tambah Pengawas"}</Button>} />
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="flex gap-3 border-b border-slate-100 p-4"><div className="relative max-w-sm flex-1"><span className="absolute left-3 top-2.5 text-slate-400"><Icon name="search" size={17} /></span><input className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm" placeholder="Cari nama atau username" /></div><select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600"><option>Semua status</option></select></div><div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{(admin ? ["Nama","Username","Role","Status","Tanggal dibuat","Aksi"] : ["Nama","Mata pelajaran","Penugasan","Status","Kelas","Aksi"]).map((head) => <th key={head} className="px-5 py-3.5">{head}</th>)}</tr></thead><tbody>{[...rows, ...extra].map((row) => <tr key={row[0]} className="border-t border-slate-100">{row.map((cell,index) => <td key={cell} className={`px-5 py-4 ${index === 0 ? "font-semibold text-slate-800" : "text-slate-600"}`}>{index === 3 ? <Badge tone={cell === "Aktif" ? "green" : "gray"}>{cell}</Badge> : cell}</td>)}<td className="px-5 py-4"><button onClick={() => admin ? (window.confirm(`Kirim tautan reset password ke ${row[0]}?`) && notify("Tautan reset password dikirim.")) : notify("Jadwal pengawas tersedia setelah backend terhubung.")} className="text-xs font-bold text-blue-700">{admin ? "Reset password" : "Lihat jadwal"}</button></td></tr>)}</tbody></table></div></section>
    {modal && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-lg rounded-md border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-slate-900">{admin ? "Tambah User" : "Tambah Pengawas"}</h2><button onClick={() => setModal(false)} className="text-slate-400"><Icon name="close" /></button></div><div className="mt-6 space-y-4"><Field label="Nama lengkap" placeholder="Masukkan nama lengkap" /><Field label="Email institusi" placeholder="nama@sman8bdg.sch.id" type="email" /><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Role</span><select className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"><option>{admin ? "Pengawas" : "Pengawas"}</option>{admin && <><option>Siswa</option><option>Penyelenggara Ujian</option><option>Pihak Sekolah</option></>}</select></label></div><div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={() => setModal(false)}>Batal</Button><Button onClick={(e) => { const d = e.currentTarget.closest("section")!; const [n, m] = Array.from(d.querySelectorAll("input")).map((i) => (i as HTMLInputElement).value.trim()); const r = (d.querySelector("select") as HTMLSelectElement).value; if (!n || !/^\S+@\S+\.\S+$/.test(m)) return notify("Isi nama lengkap dan email yang valid."); setExtra([...extra, admin ? [n, m.split("@")[0], r, "Aktif", "Hari ini"] : [n, "-", "Belum ada sesi", "Aktif", "-"]]); setModal(false); notify("User ditambahkan."); }}>Simpan</Button></div></section></div>}
  </main></AppShell>;
}

function ConfigurationPage({ go }: { go: (s: Screen) => void }) {
  const [tab, setTab] = useState("Sistem");
  const [dirty, setDirty] = useState(false);
  const [on, setOn] = useState<boolean[]>(() => { try { return JSON.parse(localStorage.getItem("eduai_cfg") ?? ""); } catch { return [true, true, true, true]; } });
  return <AppShell active="configuration" go={go} title="Konfigurasi Sistem"><main className="p-4 sm:p-8"><PageTitle title="Konfigurasi Sistem" description="Pengaturan global EduAI yang hanya dapat diakses Admin." /><div className="grid gap-6 lg:grid-cols-[240px_1fr]"><aside className="h-fit rounded-md border border-slate-200 bg-white p-2">{["Sistem","Notifikasi","Keamanan","Retensi data"].map((item) => <button key={item} onClick={() => setTab(item)} className={`w-full rounded-md px-3 py-2.5 text-left text-sm font-semibold ${tab === item ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>{item}</button>)}</aside><section className="rounded-md border border-slate-200 bg-white p-6"><h2 className="font-bold text-slate-900">Konfigurasi {tab.toLowerCase()}</h2><p className="mt-1 text-sm text-slate-500">Pengaturan berlaku untuk seluruh lingkungan sekolah.</p><div className="mt-6 space-y-4">{[["Pemantauan AI","Aktif untuk sesi terjadwal"],["Notifikasi waktu nyata","Aktif"],["Autentikasi dua langkah","Wajib untuk staf"],["Pencatatan audit","Selalu aktif"]].map(([label,value],index) => <div key={label} className="flex items-center justify-between rounded-md border border-slate-200 p-4"><div><p className="text-sm font-semibold text-slate-800">{label}</p><p className="mt-1 text-xs text-slate-500">{value}</p></div><Switch on={on[index]} label={label} onChange={() => { if (index === 3) return notify("Pencatatan audit selalu aktif."); setOn(on.map((v, i) => (i === index ? !v : v))); setDirty(true); }} /></div>)}</div><div className="mt-6 flex justify-end"><Button disabled={!dirty} onClick={() => { localStorage.setItem("eduai_cfg", JSON.stringify(on)); setDirty(false); notify("Konfigurasi disimpan."); }}>Simpan konfigurasi</Button></div></section></div></main></AppShell>;
}

function RetentionPage({ go }: { go: (s: Screen) => void }) {
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  return <AppShell active="retention" go={go} title="Retensi Data"><main className="p-4 sm:p-8"><PageTitle eyebrow="FR-WEB-22" title="Retensi & Penghapusan Data" description="Atur masa simpan terpisah dan pantau penghapusan otomatis." action={<Button disabled={!dirty} onClick={() => { setDirty(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>Simpan konfigurasi</Button>} />
    <section onChange={() => setDirty(true)} className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5">Data</th><th className="px-5 py-3.5">Masa simpan</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Aksi</th></tr></thead><tbody>{[["Video rekaman","90"],["Evidence","180"],["Laporan","365"]].map(([data,days]) => <tr key={data} className="border-t border-slate-100"><td className="px-5 py-4 font-semibold text-slate-800">{data}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><input defaultValue={days} type="number" className="h-9 w-20 rounded-md border border-slate-200 px-3 text-sm" /><span className="text-slate-500">hari</span></div></td><td className="px-5 py-4"><Badge tone="green">Aktif</Badge></td><td className="px-5 py-4"><button onClick={(e) => (e.currentTarget.closest("tr")?.querySelector("input") as HTMLInputElement | null)?.focus()} className="text-xs font-bold text-blue-700">Edit masa simpan</button></td></tr>)}</tbody></table></div><div className="border-t border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">Data yang melewati masa simpan akan dihapus secara otomatis dan dicatat dalam Audit Log.</div></section>
    <section className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white"><div className="border-b border-slate-100 p-5"><h2 className="font-bold text-slate-900">Riwayat penghapusan</h2><p className="mt-1 text-xs text-slate-500">Catatan ini tidak dapat diubah melalui aplikasi.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3.5">Nama data</th><th className="px-5 py-3.5">Jenis</th><th className="px-5 py-3.5">Waktu</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Dijalankan oleh</th></tr></thead><tbody>{[["Rekaman UTS Fisika 2024","Video","24 Mei 2025, 02.00","Berhasil","Sistem"],["Evidence IND-0188","Evidence","23 Mei 2025, 14.25","Ditahan – tidak dapat dihapus","Admin"],["Laporan Bahasa Inggris 2023","Laporan","22 Mei 2025, 02.00","Berhasil","Sistem"]].map((row) => <tr key={row[0]} className="border-t border-slate-100">{row.map((cell,index) => <td key={cell} className={`px-5 py-4 ${index === 0 ? "font-semibold text-slate-800" : "text-slate-600"}`}>{index === 3 ? <Badge tone={cell === "Berhasil" ? "green" : "amber"}>{cell}</Badge> : cell}</td>)}</tr>)}</tbody></table></div></section>
    {saved && <div role="status" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-md border border-emerald-200 bg-white p-4 text-sm font-semibold text-emerald-800"><Icon name="check" size={18} />Konfigurasi retensi berhasil disimpan.</div>}
  </main></AppShell>;
}

function AuditPage({ go }: { go: (s: Screen) => void }) {
  const rows = [["Rina Setiawati","Pengawas","24 Mei 2025, 09.45","Melakukan validasi","IND-0241","Berhasil"],["Agus Wirawan","Pengawas","24 Mei 2025, 09.42","Melihat evidence","Evidence IND-0240","Berhasil"],["Nadia Aulia","Admin","24 Mei 2025, 08.10","Mengubah konfigurasi","Retensi data","Berhasil"],["Sistem","Sistem","24 Mei 2025, 02.00","Menghapus data","Rekaman UTS 2024","Berhasil"],["Alya Putri","Siswa","24 Mei 2025, 07.58","Login","Portal ujian","Berhasil"]];
  return <AppShell active="audit" go={go} title="Audit Log"><main className="p-4 sm:p-8"><PageTitle title="Audit Log" description="Jejak aktivitas sistem bersifat hanya-baca dan tidak dapat dihapus melalui aplikasi." /><section className="overflow-hidden rounded-md border border-slate-200 bg-white"><div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-4"><div className="relative md:col-span-2"><span className="absolute left-3 top-2.5 text-slate-400"><Icon name="search" size={17} /></span><input className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm" placeholder="Cari user atau aktivitas" /></div><select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"><option>Semua role</option></select><input type="date" className="h-10 rounded-md border border-slate-200 px-3 text-sm" /></div><div className="overflow-x-auto"><table className="w-full min-w-[1060px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["User","Role","Waktu","Aktivitas","Data yang diakses","Status"].map((head) => <th key={head} className="px-5 py-3.5">{head}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]+row[2]} className="border-t border-slate-100">{row.map((cell,index) => <td key={cell} className={`px-5 py-4 ${index === 0 ? "font-semibold text-slate-800" : "text-slate-600"}`}>{index === 5 ? <Badge tone="green">{cell}</Badge> : cell}</td>)}</tr>)}</tbody></table></div></section></main></AppShell>;
}

function AccessDenied({ go }: { go: (s: Screen) => void }) {
  const { role } = useRole();
  return <div className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="w-full max-w-lg rounded-md border border-slate-200 bg-white p-10 text-center"><div className="mx-auto grid size-14 place-items-center rounded-md bg-amber-50 text-amber-700"><Icon name="shield" size={27} /></div><p className="mt-6 text-xs font-bold uppercase tracking-widest text-amber-700">403 – Akses Ditolak</p><h1 className="mt-2 text-2xl font-bold text-slate-900">{role === "Pengawas" ? "Anda tidak memiliki akses ke sesi ujian ini." : "Anda tidak memiliki izin untuk mengakses halaman ini."}</h1><p className="mt-3 text-sm leading-6 text-slate-500">{role === "Pengawas" ? "Pengawas hanya dapat membuka sesi ujian yang ditugaskan kepadanya." : `Akun dengan role ${role} tidak memiliki kewenangan untuk melihat data atau menjalankan aksi pada halaman tersebut.`}</p><Button className="mt-7" onClick={() => go("dashboard")}>Kembali ke Dasbor</Button></section></div>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [role, setRole] = useState<Role>("Pengawas");
  const [createdExam, setCreatedExam] = useState<CreatedExam | null>(null);
  const allowed: Record<Role, Screen[]> = {
    Siswa: ["login","my-exams","consent","device","exam","settings","access-denied"],
    Pengawas: ["login","dashboard","sessions","exam-detail","waiting","monitor","student-detail","detail","timeline","report","indications","history","settings","access-denied"],
    "Penyelenggara Ujian": ["login","dashboard","sessions","exam-detail","create","students","settings","access-denied"],
    Admin: ["login","dashboard","sessions","exam-detail","create","students","users","configuration","retention","audit","settings","access-denied"],
    "Pihak Sekolah": ["login","access-denied"],
  };
  const enter = (r: Role) => { setRole(r); setScreen(r === "Siswa" ? "my-exams" : "dashboard"); window.scrollTo({ top: 0 }); };
  useTableFilter();
  const go = (next: Screen) => { setScreen(next === "login" || next === "landing" || allowed[role].includes(next) ? next : "access-denied"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  let page: ReactNode;
  if (screen === "landing") page = <Landing go={go} />;
  else if (screen === "login") page = <Login go={go} enter={enter} />;
  else if (screen === "dashboard") page = <Dashboard go={go} />;
  else if (screen === "sessions") page = <Sessions go={go} />;
  else if (screen === "create") page = <AdminCreateExam go={go} />;
  else if (screen === "exam-detail") page = <ExamDetail go={go} />;
  else if (screen === "waiting") page = <WaitingRoom go={go} />;
  else if (screen === "consent") page = <Consent go={go} />;
  else if (screen === "device") page = <Device go={go} />;
  else if (screen === "exam") page = <ExamRoom go={go} />;
  else if (screen === "monitor") page = <Monitoring go={go} />;
  else if (screen === "student-detail") page = <StudentMonitoringDetail go={go} />;
  else if (screen === "detail") page = <SupervisorEvidenceDetail go={go} />;
  else if (screen === "timeline") page = <MonitoringTimeline go={go} />;
  else if (screen === "report") page = <Report go={go} />;
  else if (screen === "indications") page = <IndicationsPage go={go} />;
  else if (screen === "history") page = <HistoryPage go={go} />;
  else if (screen === "my-exams") page = <MyExams go={go} />;
  else if (screen === "students") page = <StudentList go={go} />;
  else if (screen === "users") page = <UserManagement go={go} />;
  else if (screen === "configuration") page = <ConfigurationPage go={go} />;
  else if (screen === "retention") page = <RetentionPage go={go} />;
  else if (screen === "audit") page = <AuditPage go={go} />;
  else if (screen === "access-denied") page = <AccessDenied go={go} />;
  else page = <Settings go={go} />;
  return <RoleContext.Provider value={{ role, setRole }}><ExamContext.Provider value={{ createdExam, setCreatedExam }}>{page}<Toaster /></ExamContext.Provider></RoleContext.Provider>;
}
