import React from "react";

const features = [
  {
    title: "Cleaner Routes",
    text: "Compare available routes with their AQI exposure and travel details.",
    icon: <><path d="M4 18c4-8 8-10 16-12"/><path d="M5 7h.01M19 18h.01"/><circle cx="5" cy="7" r="2"/><circle cx="19" cy="18" r="2"/></>,
  },
  {
    title: "Environmental Intelligence",
    text: "Bring environmental conditions and air quality into route analysis.",
    icon: <><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2 2 3 5 3 8s-1 6-3 8c-2-2-3-5-3-8s1-6 3-8Z"/></>,
  },
  {
    title: "Health-Aware Routing",
    text: "Use your selected health profile when ranking route options.",
    icon: <><path d="M20.8 8.6c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.4Z"/><path d="M7 12h3l1.2-2.2L13 15l1.2-3H17"/></>,
  },
  {
    title: "Smart Route Comparison",
    text: "Review AQI, travel time and exposure scores before choosing a route.",
    icon: <><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 12h8M8 15h5"/></>,
  },
];

const steps = [
  "Choose your destination",
  "Analyze available routes",
  "Understand AQI & health exposure",
  "Choose the route that works for you",
];

function FeatureIcon({ children }) {
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#d9ece1] bg-[#f1f8f3] text-[#168b62]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">{children}</svg>
    </span>
  );
}

function MobilityVisual() {
  return (
    <div className="relative mx-auto aspect-[1.2/1] w-full max-w-[500px] overflow-hidden rounded-[2rem] border border-[#dcebe1] bg-[#edf5ef] p-5 sm:p-7" aria-label="Illustration of clean urban mobility routes" role="img">
      <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border border-[#d1e5d7]" />
      <div className="absolute -right-2 -top-6 h-36 w-36 rounded-full border border-[#d1e5d7]" />
      <svg viewBox="0 0 480 350" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <path d="M-12 267C87 252 86 190 164 204c78 14 88 89 166 70 55-13 80-81 166-95" stroke="#c5d9cd" strokeWidth="28" strokeLinecap="round" />
        <path d="M-12 267C87 252 86 190 164 204c78 14 88 89 166 70 55-13 80-81 166-95" stroke="#f8fbf8" strokeWidth="2" strokeDasharray="7 9" />
        <path d="M30 316c89-42 88-118 165-118s89 99 161 76 69-100 144-122" stroke="#168b62" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 0" />
        <path d="M55 130c40-37 91-34 129-5 27 21 46 24 72 5" stroke="#b6d6c2" strokeWidth="2" strokeDasharray="5 8" />
        <path d="M349 90c-27 24-35 45-28 70" stroke="#b6d6c2" strokeWidth="2" strokeDasharray="5 8" />
        <g fill="#d4e6d9"><rect x="77" y="91" width="38" height="53" rx="5"/><rect x="121" y="74" width="47" height="70" rx="5"/><rect x="174" y="101" width="31" height="43" rx="5"/><rect x="338" y="142" width="40" height="55" rx="5"/><rect x="384" y="119" width="48" height="78" rx="5"/></g>
        <g fill="#edf5ef"><path d="M87 102h7v8h-7zm15 0h7v8h-7zm-15 16h7v8h-7zm24 0h7v8h-7zm21-31h8v9h-8zm17 0h8v9h-8zm-17 18h8v9h-8zm17 0h8v9h-8zm-17 18h8v9h-8zm17 0h8v9h-8zm34-12h7v8h-7zm15 0h7v8h-7zM349 153h8v9h-8zm17 0h8v9h-8zm-17 18h8v9h-8zm53-39h8v9h-8zm17 0h8v9h-8zm-17 18h8v9h-8zm17 0h8v9h-8z"/></g>
        <g><circle cx="30" cy="267" r="10" fill="#fff" stroke="#168b62" strokeWidth="4"/><circle cx="300" cy="274" r="10" fill="#fff" stroke="#168b62" strokeWidth="4"/><circle cx="442" cy="179" r="10" fill="#fff" stroke="#168b62" strokeWidth="4"/></g>
        <g stroke="#6e927a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="259" cy="170" r="6" fill="#f8fbf8"/><path d="M259 177v18l-9 11m9-11 9 10m-9-17-9 9m9-9 9 4"/><circle cx="282" cy="177" r="5" fill="#f8fbf8"/><path d="M282 183v15l-7 8m7-8 7 8"/></g>
        <g><rect x="317" y="243" width="48" height="22" rx="7" fill="#fff" stroke="#9fc9ad" strokeWidth="2"/><path d="M325 243v-8h17l8 8" stroke="#9fc9ad" strokeWidth="2"/><circle cx="328" cy="266" r="4" fill="#6e927a"/><circle cx="353" cy="266" r="4" fill="#6e927a"/></g>
        <path d="M235 302c-12-17-10-31 3-39 14-8 27-2 28 12 1 15-12 25-31 27Z" fill="#d4e9da" stroke="#9fc9ad" strokeWidth="1.5"/><path d="M238 295c8-12 14-19 22-24" stroke="#79af8c" strokeWidth="2" strokeLinecap="round"/>
      </svg>
      <div className="absolute left-4 top-4 rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm sm:left-6 sm:top-6">
        <p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#789087]">Connected journeys</p>
        <p className="mt-0.5 text-xs font-bold text-[#315447]">India · City to city</p>
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl border border-white/80 bg-white/95 px-3 py-2 shadow-sm sm:bottom-6 sm:right-6">
        <span className="h-2.5 w-2.5 rounded-full bg-[#168b62]" />
        <span className="text-[10px] font-bold text-[#315447]">Cleaner mobility, informed by air</span>
      </div>
    </div>
  );
}

function MissionVisual() {
  return (
    <div className="relative min-h-56 overflow-hidden rounded-3xl border border-[#dbe8de] bg-[#edf5ef] sm:min-h-64" role="img" aria-label="People moving through a greener city">
      <svg viewBox="0 0 520 280" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
        <circle cx="420" cy="52" r="30" fill="#dcebdc"/><circle cx="420" cy="52" r="43" stroke="#d4e5d8"/>
        <path d="M0 191h520v89H0z" fill="#e1ece4"/><path d="M0 210c108-19 178 12 269-4 88-15 156-8 251-29" stroke="#c4d9ca" strokeWidth="25"/><path d="M0 210c108-19 178 12 269-4 88-15 156-8 251-29" stroke="#f9fbf9" strokeWidth="2" strokeDasharray="8 9"/>
        <g fill="#c7dccd"><path d="M44 191V89h60v102zm70 0V58h81v133zm90 0v-78h53v78zm191 0V92h62v99zm70 0V68h34v123z"/></g>
        <g fill="#eef5ef"><path d="M57 104h11v14H57zm24 0h11v14H81zm-24 24h11v14H57zm24 0h11v14H81zm47-54h13v16h-13zm29 0h13v16h-13zm-29 27h13v16h-13zm29 0h13v16h-13zm-29 27h13v16h-13zm29 0h13v16h-13zm202-20h12v14h-12zm25 0h12v14h-12zm-25 25h12v14h-12zm25 0h12v14h-12z"/></g>
        <path d="M37 184c0-19 13-34 29-34s29 15 29 34" fill="#9dbda5"/><path d="M27 184h78" stroke="#6e927a" strokeWidth="5" strokeLinecap="round"/><path d="M436 184c0-21 14-38 31-38s31 17 31 38" fill="#9dbda5"/><path d="M427 184h82" stroke="#6e927a" strokeWidth="5" strokeLinecap="round"/>
        <path d="M88 222c82-3 111 28 204 20s119-37 218-43" stroke="#168b62" strokeWidth="3" strokeDasharray="5 8" strokeLinecap="round"/>
        <g fill="#557f63"><circle cx="171" cy="171" r="8"/><path d="M159 195c1-12 4-17 12-17s12 5 13 17l3 17h-31z"/><circle cx="204" cy="176" r="7"/><path d="M194 197c1-10 4-15 10-15s10 5 11 15l2 15h-25z"/></g>
        <path d="M169 212v14m7-14v14m24-14v14m7-14v14" stroke="#557f63" strokeWidth="3" strokeLinecap="round"/>
        <path d="M304 57c-7-15-3-25 9-29 11 10 9 20-9 29Zm1-2c-1-16 5-25 17-27" stroke="#70a481" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className="absolute bottom-4 left-4 rounded-xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm sm:bottom-5 sm:left-5">
        <p className="text-[9px] font-bold uppercase tracking-[.13em] text-[#789087]">People · place · cleaner journeys</p>
      </div>
    </div>
  );
}

export default function AboutScreen({ onNavigateHome }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-4 py-6 pb-24 sm:px-6 sm:py-9 lg:space-y-10">
      <section className="grid items-center gap-8 rounded-[2rem] border border-[#dbe7df] bg-white p-6 shadow-sm sm:p-9 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:p-11">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]"><span className="h-2 w-2 rounded-full bg-[#168b62]" />AeroMobility · Environmental Intelligence</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-[#17352b] sm:text-5xl lg:text-[3.35rem]">Moving Smarter.<br />Breathing Better.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#60776c] sm:text-base">AeroMobility combines environmental intelligence, AQI-aware route analysis, cleaner mobility and personalized health profiles to help you compare routes and make informed travel choices.</p>
          <button type="button" onClick={onNavigateHome} className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#168b62] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#127250]">Find a Cleaner Route <span aria-hidden="true">→</span></button>
        </div>
        <MobilityVisual />
      </section>

      <section className="grid items-center gap-6 rounded-[2rem] border border-[#dbe7df] bg-[#f8fbf8] p-6 sm:p-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-10 lg:p-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">India · Everyday journeys</p>
          <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-[#17352b] sm:text-3xl">Built for the journeys that connect India.</h2>
          <p className="mt-3 text-sm leading-7 text-[#60776c]">From everyday commutes to long city journeys, AeroMobility brings air quality and environmental intelligence into the decisions people make every day.</p>
        </div>
        <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-2xl border border-[#e0ece3] bg-white px-4 py-5 sm:min-h-64 sm:px-6">
          <svg viewBox="0 0 560 220" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
            <path d="m269 19 24 8 17 15 26 4 17 15 21 2 11 19-10 17 14 18-18 14-4 20-16 12-6 25-19 15-14-14-8-24-14-17-15-23-17-16-12-21-23-9-12-19 11-16 21-8 9-17 26-5Z" fill="#eff6f0" stroke="#d6e6da" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M229 63c28 13 37 27 52 37s31 6 41 22 25 15 44 21" stroke="#168b62" strokeWidth="3" strokeDasharray="5 7" strokeLinecap="round"/>
            <path d="M250 42c15 19 27 37 31 58m42-61c-13 20-19 39-12 61m-66 11c20-3 42-7 66-11m-40 44c17-11 28-24 40-44m-19 50c-5-14-13-26-21-38" stroke="#b7d4c0" strokeWidth="1.5" strokeDasharray="3 6"/>
            <circle cx="250" cy="63" r="5" fill="#168b62"/><circle cx="281" cy="100" r="5" fill="#168b62"/><circle cx="322" cy="122" r="5" fill="#168b62"/><circle cx="303" cy="144" r="5" fill="#168b62"/><circle cx="355" cy="143" r="5" fill="#168b62"/>
            <path d="M38 176c70-42 119-49 181-17m143-92c49-30 101-29 156 1" stroke="#e5eee7" strokeWidth="2" strokeDasharray="3 8"/>
            <circle cx="38" cy="176" r="4" fill="#94b99e"/><circle cx="219" cy="159" r="4" fill="#94b99e"/><circle cx="362" cy="67" r="4" fill="#94b99e"/><circle cx="518" cy="68" r="4" fill="#94b99e"/>
          </svg>
          <div className="absolute left-3 top-3 rounded-lg border border-[#e3eee6] bg-white/95 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-[#52796f] shadow-sm sm:left-5 sm:top-5 sm:text-[10px]">India · Connected by cleaner choices</div>
          <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-2 sm:bottom-5 sm:left-5 sm:right-5">
            {["Daily commute", "City journeys", "Cleaner choices"].map((label) => <span key={label} className="rounded-full border border-[#dcebe1] bg-white/95 px-2 py-1.5 text-center text-[9px] font-bold text-[#52796f] shadow-sm sm:px-3 sm:text-[10px]">{label}</span>)}
          </div>
        </div>
      </section>

      <section className="relative grid items-center gap-6 overflow-hidden rounded-[2rem] border border-[#cfe4d6] bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-9 lg:p-10">
        <span aria-hidden="true" className="absolute -right-10 -top-14 h-44 w-44 rounded-full border border-[#e4f0e7] sm:h-64 sm:w-64" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#168b62]">Our Mission</p>
          <span aria-hidden="true" className="mt-3 block font-display text-5xl leading-none text-[#b7d8c3]">“</span>
          <h2 className="-mt-2 max-w-2xl font-display text-2xl font-semibold leading-snug text-[#17352b] sm:text-3xl">To make everyday mobility cleaner, healthier and more informed by connecting route decisions with environmental and health intelligence.</h2>
        </div>
        <MissionVisual />
      </section>

      <section>
        <div className="mb-4 px-1"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Environmental intelligence for every trip</p><h2 className="mt-1 font-display text-2xl font-bold text-[#17352b] sm:text-3xl">What AeroMobility Does</h2></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature, index) => <article key={feature.title} className="group flex gap-4 rounded-3xl border border-[#dbe7df] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#c2ddcb] hover:shadow-md sm:p-6"><FeatureIcon>{feature.icon}</FeatureIcon><div><p className="text-[9px] font-bold uppercase tracking-[.13em] text-[#84a391]">0{index + 1} · Mobility insight</p><h3 className="mt-1 font-display text-base font-bold text-[#17352b]">{feature.title}</h3><p className="mt-1.5 text-sm leading-6 text-[#60776c]">{feature.text}</p></div></article>)}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#dbe7df] bg-white p-6 sm:p-8 lg:p-10">
        <div className="mb-5"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">A clearer journey</p><h2 className="mt-1 font-display text-2xl font-bold text-[#17352b] sm:text-3xl">How It Works</h2></div>
        <div className="relative">
          <div aria-hidden="true" className="absolute bottom-9 left-8 top-9 border-l-2 border-dashed border-[#c4ddcc] lg:hidden" />
          <svg viewBox="0 0 1000 48" preserveAspectRatio="none" className="pointer-events-none absolute left-0 right-0 top-5 hidden h-12 w-full lg:block" fill="none" aria-hidden="true">
            <path d="M125 24C215 24 250 7 375 24S535 41 625 24s160-17 250 0" stroke="#c4ddcc" strokeWidth="2" strokeDasharray="5 7" />
            <circle cx="125" cy="24" r="4" fill="#168b62"/><circle cx="375" cy="24" r="4" fill="#168b62"/><circle cx="625" cy="24" r="4" fill="#168b62"/><circle cx="875" cy="24" r="4" fill="#168b62"/>
          </svg>
          <ol className="relative grid gap-3 lg:grid-cols-4 lg:gap-0">
            {steps.map((step, index) => <li key={step} className="flex items-center gap-4 rounded-2xl px-2 py-3 lg:min-h-36 lg:flex-col lg:items-center lg:justify-between lg:px-4 lg:py-5 lg:text-center">
              <span className="z-10 grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#cfe4d6] bg-white font-display text-sm font-bold tracking-tight text-[#168b62] shadow-sm">0{index + 1}</span>
              <span className="max-w-[15rem] text-sm font-bold leading-6 text-[#315447]">{step}</span>
            </li>)}
          </ol>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-3xl border border-[#dbe7df] bg-white p-6 sm:p-7"><h2 className="font-display text-xl font-bold text-[#17352b]">Why It Matters</h2><p className="mt-3 text-sm leading-7 text-[#60776c]">Urban mobility is not only about reaching a destination. Route choices can also affect exposure to pollution, congestion and environmental conditions. AeroMobility brings these factors together to support more informed travel decisions.</p></section>
        <section className="rounded-3xl border border-[#dbe7df] bg-white p-6 sm:p-7"><h2 className="font-display text-xl font-bold text-[#17352b]">Our Vision</h2><p className="mt-3 text-sm leading-7 text-[#60776c]">A future where sustainable and health-conscious mobility becomes a natural part of everyday travel.</p></section>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] border border-[#cfe4d6] bg-[#f2f8f3] px-6 py-9 text-center sm:px-10 sm:py-12">
        <svg viewBox="0 0 900 240" className="pointer-events-none absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
          <path d="M-20 207C145 207 166 36 335 51s175 155 328 126S809 50 920 34" stroke="#dcebe0" strokeWidth="26" strokeLinecap="round"/>
          <path d="M-20 207C145 207 166 36 335 51s175 155 328 126S809 50 920 34" stroke="#9ec9aa" strokeWidth="2" strokeDasharray="4 9" strokeLinecap="round"/>
          <circle cx="166" cy="113" r="5" fill="#168b62"/><circle cx="663" cy="177" r="5" fill="#168b62"/><circle cx="821" cy="60" r="5" fill="#168b62"/>
        </svg>
        <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/70 bg-[#f2f8f3]/90 px-4 py-4 backdrop-blur-[1px] sm:px-8 sm:py-6">
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">AeroMobility</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-[#17352b] sm:text-3xl">Your journey matters.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#60776c]">Choose a route that takes you where you need to go — with a clearer view of the air along the way.</p>
          <button type="button" onClick={onNavigateHome} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#168b62] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#127250]">Find a Cleaner Route <span aria-hidden="true">→</span></button>
        </div>
      </section>
    </div>
  );
}
