 import { Analytics } from "@vercel/analytics/react";
import React, { useState, useRef } from 'react';
import { 
  Upload, Wind, BarChart3, CheckCircle, AlertCircle, 
  FileText, Clipboard, ChevronRight, Info, XCircle, Gauge, Search, Download
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Import your logo here
import logo from './assets/Untitled design-4.png';

// ... (Keep all your existing Supabase and State logic exactly the same) ...

const supabaseUrl = 'https://rtllzorijfwihfrydncg.supabase.co';
const supabaseKey = 'sb_publishable_LFKAeATxFCXRb3uG3bq2jQ_uqQETKeU';
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  // ... (Keep all your existing state and handler functions) ...
  const [description, setDescription] = useState('');
  const [currentPage, setCurrentPage] = useState('home');
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [foundResult, setFoundResult] = useState(null);
  const fileInputRef = useRef(null);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'submit', label: 'Submit Design' },
    { id: 'results', label: 'View Results' }
  ];

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!searchId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('submission_id', searchId)
      .single();
    if (error || !data) {
      setFoundResult('not-found');
    } else {
      setFoundResult(data);
    }
    setLoading(false);
  };

const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const id = `Venkly-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const file = selectedFile;
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('design-files')
      .upload(fileName, file);

    if (uploadError) {
      alert("Error uploading file: " + uploadError.message);
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase
      .from('submissions')
      .insert([{ 
        submission_id: id, 
        project_title: projectTitle, 
        description: description,
        file_url: fileName,
        status: 'Under Review' 
      }]);

    if (!dbError) {
      setSubmissionId(id);
      setSubmitted(true);
    } else {
      alert("Error saving to database: " + dbError.message);
    }
    
    setLoading(false);
};

// ... (Keep ResultsPage, CapabilitiesPage, SubmitPage, and HomePage components as they are) ...
const ResultsPage = () => (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Submission Status & Results</h2>
        <p className="text-slate-500 mt-2">Enter your Submission ID to check progress or download test data.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto">
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Submission ID</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="e.g. Venkly-1234"
                className="flex-1 p-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              />
              <button type="submit" className="bg-blue-600 text-white px-6 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
                <Search size={18} /> Check
              </button>
            </div>
          </div>
        </form>

        {foundResult === 'not-found' && (
          <div className="mt-6 p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 flex items-center gap-3 text-sm font-bold">
            <XCircle size={18} /> No submission found with that ID.
          </div>
        )}

        {foundResult && foundResult !== 'not-found' && (
          <div className="mt-8 border-t border-slate-100 pt-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Current Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                  <span className="font-black text-xl text-slate-900">{foundResult.status}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Submitted On</p>
                <p className="font-bold text-slate-700">{foundResult.date || new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-1">{foundResult.project_title || foundResult.project}</h4>
              <p className="text-sm text-slate-500">Your design is currently being screened for wind tunnel safety and dimensional accuracy.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => window.open(`${supabaseUrl}/storage/v1/object/public/design-files/${foundResult.file_url}`)}
                className="p-4 rounded-2xl border border-blue-200 text-blue-600 text-sm font-bold flex flex-col items-center gap-2 hover:bg-blue-50 transition-all"
              >
                <Download size={20} /> Download Data
              </button>
              
              <button className="p-4 rounded-2xl border border-slate-200 text-slate-400 text-sm font-bold flex flex-col items-center gap-2 cursor-not-allowed">
                <BarChart3 size={20} /> Analysis PDF
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400 italic">Downloadable results will appear here once testing is complete.</p>
          </div>
        )}
      </div>
    </div>
  );

  const CapabilitiesPage = () => (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Technical Capabilities</h2>
        <p className="text-slate-500 mt-2">Experimental constraints and facility specifications for the Venkly Wind Tunnel to experiment with your aerodynamics.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <Gauge className="text-blue-600 mb-3" size={28} />
          <h3 className="font-bold text-slate-900">Max Wind Speed</h3>
          <p className="text-2xl font-black text-blue-600">1 m/s</p>
          <p className="text-xs text-slate-500 mt-1 italic">Variable & Adjustable</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900">Test Section Dimensions</h3>
              <p className="text-slate-500 text-sm">Strict limits for model compatibility.</p>
            </div>
            <div className="flex gap-4 text-right">
              <div><p className="text-xs font-bold text-slate-400">WIDTH</p><p className="font-black text-xl">30cm</p></div>
              <div><p className="text-xs font-bold text-slate-400">DEPTH</p><p className="font-black text-xl">22cm</p></div>
              <div><p className="text-xs font-bold text-slate-400">HEIGHT</p><p className="font-black text-xl">15cm</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100">
          <h3 className="text-emerald-800 font-bold text-lg mb-4 flex items-center gap-2">
            <CheckCircle size={20} /> Suitable For
          </h3>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li>• Small aerodynamic components & UAV parts</li>
            <li>• Fairings, ducts, and housings</li>
            <li>• Comparative drag-focused designs</li>
            <li>• Educational airflow demonstrations</li>
            <li>• Relative performance trend analysis</li>
            <li>• Great for Wind Tunnel Testing for STEM</li>
            <li>• Student-friendly</li>
          </ul>
        </div>
        <div className="bg-rose-50/50 p-8 rounded-3xl border border-rose-100">
          <h3 className="text-rose-800 font-bold text-lg mb-4 flex items-center gap-2">
            <XCircle size={20} /> Explicit Exclusions
          </h3>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li>• Full-scale vehicles or aircraft</li>
            <li>• High-Reynolds-number validation</li>
            <li>• Structural strength or failure testing</li>
            <li>• Active propulsion systems</li>
            <li>• Large moving mechanisms</li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Info size={20} className="text-blue-400" /> Experimental Reality
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Venkly focuses on <strong>educational analysis and design iteration</strong>. 
            Results are influenced by scale effects and blockage. We emphasize comparative 
            insights over absolute full-scale prediction. Measurement uncertainty is 
            treated as a core part of the engineering experience.
          </p>
          <div className="mt-8 grid md:grid-cols-2 gap-6 border-t border-slate-800 pt-8">
            <div>
              <h4 className="font-bold text-blue-400 text-xs uppercase tracking-widest mb-2">Data Outputs</h4>
              <p className="text-sm text-slate-300">CSV Numerical Datasets, Force vs Wind Speed Graphs, Comparative Performance Plots. Aerodynamic Forces with Flow Visualisation and Data Validation using the free Venkly Wind Tunnel.</p>
            </div>
            <div>
              <h4 className="font-bold text-blue-400 text-xs uppercase tracking-widest mb-2">Educational Value</h4>
              <p className="text-sm text-slate-300">Validate simulation assumptions and observe the delta between theoretical and physical behavior.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SubmitPage = () => {
    if (submitted) {
      return (
        <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl border border-blue-100 shadow-xl text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Submission Received</h2>
          <p className="text-slate-500 mb-8">Your design has been queued for feasibility review.</p>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Unique Submission ID</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl font-mono font-black text-blue-600">{submissionId}</span>
              <button onClick={() => navigator.clipboard.writeText(submissionId)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <Clipboard size={20} className="text-slate-500" />
              </button>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 bg-amber-50 p-4 rounded-xl border border-amber-100 inline-block mb-8">
            <strong>Important:</strong> Save this ID. You will need it to check your submission status.
          </p>
          <br />
          <button 
            onClick={() => {setSubmitted(false); setCurrentPage('home');}}
            className="text-blue-600 font-bold hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Design Submission</h2>
          <p className="text-slate-500 mt-2">Submit your CAD model for physical aerodynamic testing.</p>
        </div>

        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
          <div className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg flex items-center gap-2 text-blue-600">
              <FileText size={20} /> Project Details
            </h3>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Project Title</label>
              <input required type="text" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Winglet Var-1" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Test Type</label>
              <select className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                <option>Drag Comparison</option>
                <option>Airflow Behavior (Smoke)</option>
                <option>Proof of Concept Validation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Brief Description</label>
              <textarea 
                required 
                rows="4" 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none" 
                placeholder="Purpose, expected outcomes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg flex items-center gap-2 text-blue-600">
              <Upload size={20} /> Design Files
            </h3>
            <div onClick={() => fileInputRef.current.click()} className={`border-2 border-dashed rounded-2xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer group ${selectedFile ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100">
                <Upload size={24} className="text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-700">{selectedFile ? selectedFile.name : 'Upload CAD Model'}</p>
              <p className="text-xs text-slate-400 mt-1">STL, STEP, or IGES formats</p>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 bg-amber-50/50 p-8 rounded-2xl border border-amber-100">
            <h3 className="font-bold text-lg flex items-center gap-2 text-amber-700">
              <AlertCircle size={20} /> Physical Constraints Confirmation
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                "Design fits within 30 × 22 × 15 cm",
                "Suitable for wind speeds up to 1 m/s",
                "Acknowledged low-Reynolds-number test"
              ].map((text, i) => (
                <label key={i} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-amber-200 cursor-pointer hover:shadow-sm transition-shadow">
                  <input required type="checkbox" className="w-5 h-5 accent-amber-600" />
                  <span className="text-sm font-medium text-slate-700 leading-tight">{text}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 pt-6">
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3">
              {loading ? "Uploading..." : "Submit Design for Testing"} <ChevronRight size={24} />
            </button>
          </div>
        </form>
      </div>
    );
  };

  const HomePage = () => (
    <div className="space-y-16">
      <section className="text-center py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 rounded-[3rem] px-6 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <Wind className="absolute top-10 right-10 scale-[5]" />
        </div>
        <h1 className="text-6xl font-black mb-6 tracking-tighter leading-none">
          WIND TUNNEL TESTING FOR STEM STUDENTS
        </h1>
        <p className="text-xl opacity-80 mb-10 max-w-2xl mx-auto font-medium">
          Use your CAD model for wind tunnel testing, where students can access free physical wind tunnel results. The best file formats to submit CAD models are .step and .stl. It is low-cost (free), and can be used for scaled models!
        </p>
        <button 
          onClick={() => setCurrentPage('submit')}
          className="bg-white text-blue-700 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2 mx-auto shadow-xl"
        >
          <Upload size={20} /> START SUBMISSION
        </button>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        {[
          { icon: <Wind />, color: "bg-blue-100 text-blue-600", title: "Physical Tunnel", text: "30×22×15 cm section, testing up to 1 m/s." },
          { icon: <BarChart3 />, color: "bg-emerald-100 text-emerald-600", title: "Live Data", text: "Access high-res CSV and performance graphs." },
          { icon: <CheckCircle />, color: "bg-purple-100 text-purple-600", title: "Validation", text: "The gold standard for engineering students." }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className={`p-3 rounded-xl inline-block ${item.color}`}>
              {item.icon}
            </div>
            <h3 className="font-bold text-slate-900 mt-4">{item.title}</h3>
            <p className="text-slate-600 mt-2">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );

return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans flex flex-col">
      <nav className="max-w-4xl mx-auto w-full flex items-center justify-between mb-12 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Wind className="text-white" size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900">VENKLY</span>
        </div>
        
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                currentPage === item.id 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setCurrentPage('submit')}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold md:hidden"
        >
          Submit
        </button>
      </nav>

      <main className="max-w-6xl mx-auto flex-grow w-full">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'capabilities' && <CapabilitiesPage />}
        {currentPage === 'submit' && <SubmitPage />}
        {currentPage === 'results' && <ResultsPage />}
      </main>

      {/* --- UPDATED FOOTER WITH LOGO --- */}
      <footer className="max-w-4xl mx-auto w-full text-center py-10 text-sm text-slate-500 border-t border-slate-200 mt-12 space-y-2 relative">
        <p>If you want the fan details or want to buy the fan yourself, please <a href="https://powerstarelectricals.co.uk/industrial-extractor-exhaust-wall-mounted-plate-fan-with-speed-controller-1064-p.asp" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">visit that website</a>.</p>
        <p>&copy; {new Date().getFullYear()} Siddharth Santhosh. All rights reserved.</p>
        
        <img 
          src={logo} 
          alt="Logo" 
          className="absolute bottom-0 right-0 w-12 h-12 object-contain opacity-80"
        />
      </footer>
      
      <Analytics />
    </div>
  );
};

export default App;
