import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

// This is a placeholder for your public reCAPTCHA Site Key.
// In a later step, I'll show you how to get this for free from Google.
const RECAPTCHA_SITE_KEY = "YOUR_RECAPTCHA_SITE_KEY_GOES_HERE";

// --- SECURE API HELPER ---
// This function now calls our own secure backend function instead of Google directly.
const callOurSecureAPI = async (systemInstruction, history, newUserMessage, imageBase64 = null, recaptchaToken) => {
    try {
        const response = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction,
                history,
                newUserMessage,
                imageBase64,
                recaptchaToken // We now send the "Human Pass" token for verification
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server function failed with status: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return result.text;

    } catch (error) {
        console.error("Error calling our secure function:", error);
        return "There was an error connecting to the AI. Please check your connection and try again.";
    }
};


// Main App Component: Manages navigation between screens
const App = () => {
    const [view, setView] = useState('home'); // 'home', 'onboarding', 'chat'

    const navigateTo = (screen) => setView(screen);

    let content;
    if (view === 'home') {
        content = <HomeScreen onNavigate={navigateTo} />;
    } else if (view === 'onboarding') {
        content = <OnboardingForm />;
    } else if (view === 'chat') {
        content = <Chat onBack={() => navigateTo('home')} />;
    }

    return (
        <div className="bg-slate-900 text-gray-200 min-h-screen font-sans">
            <div className="container mx-auto p-4 md:p-8 relative z-10">
                <Header />
                {content}
            </div>
        </div>
    );
};

// Header Component
const Header = () => (
    <header className="text-center mb-10">
        <h1 className="text-5xl md:text-6xl font-bold text-orange-500">FitnessForge AI</h1>
        <p className="text-xl text-gray-400 mt-3">Your personalized workout and diet planner.</p>
    </header>
);

// --- NEW HOME SCREEN COMPONENT ---
const HomeScreen = ({ onNavigate }) => (
    <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg p-8 md:p-10 max-w-4xl mx-auto border border-slate-700 text-center">
        <div className="max-w-md mx-auto mb-6">
            <svg className="w-full" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M128.5 76.5C132.5 73.5 137 71 137 66C137 59.5 125 57.5 125 51.5C125 45.5 131.5 44 135 42.5" stroke="#FF7A00" strokeWidth="3" strokeLinecap="round"/>
                <path d="M70 76.5C66.5 73.5 62.5 71 62.5 66C62.5 59.5 74 57.5 74 51.5C74 45.5 67.5 44 64.5 42.5" stroke="#FF7A00" strokeWidth="3" strokeLinecap="round"/>
                <path d="M100 120C123.5 120 133 97 122.5 83.5C112 70 87.5 70 77 83.5C66.5 97 76.5 120 100 120Z" fill="#FF7A00"/>
                <path d="M100 81V100" stroke="#FF8A1F" strokeWidth="4" strokeLinecap="round"/>
                <path d="M89 100L100 100" stroke="#FF8A1F" strokeWidth="4" strokeLinecap="round"/>
                <path d="M110 100H100" stroke="#FF8A1F" strokeWidth="4" strokeLinecap="round"/>
                <path d="M100 90H89" stroke="#FF8A1F" strokeWidth="4" strokeLinecap="round"/>
                <path d="M110 90H100" stroke="#FF8A1F" strokeWidth="4" strokeLinecap="round"/>
                <path d="M110 82H100" stroke="#FF8A1F" strokeWidth="4" strokeLinecap="round"/>
                <path d="M89 82H100" stroke="#FF8A1F" strokeWidth="4" strokeLinecap="round"/>
                <path d="M125.5 54C125.5 54 121.5 66 112 80H87.5C78 66 73.5 54 73.5 54C73.5 47 77.5 41.5 82 39C86.5 36.5 95 35 100 35C105 35 113.5 36.5 117.5 39C122 41.5 125.5 47 125.5 54Z" fill="#FF7A00"/>
                <path d="M165 67C165 77.464 156.464 86 146 86L146 48C156.464 48 165 56.536 165 67Z" fill="#262626"/>
                <rect x="175" y="48" width="10" height="38" rx="5" fill="#262626"/>
                <rect x="190" y="48" width="5" height="38" rx="2.5" fill="#262626"/>
                <path d="M35 67C35 56.536 43.536 48 54 48V86C43.536 86 35 77.464 35 67Z" fill="#262626"/>
                <rect x="15" y="48" width="10" height="38" rx="5" fill="#262626"/>
                <rect x="5" y="48" width="5" height="38" rx="2.5" fill="#262626"/>
                <rect x="35" y="65" width="130" height="4" rx="2" fill="#404040"/>
            </svg>
        </div>
        <h2 className="text-3xl font-semibold mb-2 text-gray-100">Forge Your Path</h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">Choose your journey. Get a fully personalized plan or get quick answers from our AI coach.</p>
        <div className="grid md:grid-cols-2 gap-6">
            <div onClick={() => onNavigate('onboarding')} className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 hover:border-cyan-400 cursor-pointer transition-colors">
                <h3 className="text-xl font-bold text-cyan-400 mb-2">Create Personalized Plan</h3>
                <p className="text-gray-400">Get a plan tailored to your body, goals, and lifestyle. The ultimate personalized experience.</p>
            </div>
            <div onClick={() => onNavigate('chat')} className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 hover:border-orange-400 cursor-pointer transition-colors">
                 <h3 className="text-xl font-bold text-orange-400 mb-2">Ask a Quick Question</h3>
                <p className="text-gray-400">Jump straight into a chat to ask general fitness, nutrition, or exercise questions.</p>
            </div>
        </div>
    </div>
);

// --- HELPER UI COMPONENTS ---
const FormInput = ({ label, type, placeholder, value, onChange, name }) => (
    <div>
        <label className="block text-base font-medium text-gray-300 mb-2">{label}</label>
        <input type={type} placeholder={placeholder} value={value} onChange={onChange} name={name} className="w-full text-base px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 placeholder-gray-500" />
    </div>
);

const GoalCard = ({ icon, title, description, isSelected, onSelect }) => (
    <div onClick={onSelect} className={`p-5 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-cyan-400 bg-slate-700 ring-2 ring-cyan-400' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
        <div className="flex items-center space-x-4">
            <div className={`text-2xl ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`}>{icon}</div>
            <div>
                <h3 className={`font-semibold text-lg ${isSelected ? 'text-cyan-400' : 'text-gray-200'}`}>{title}</h3>
                <p className="text-base text-gray-400">{description}</p>
            </div>
        </div>
    </div>
);

const SelectionButton = ({ label, isSelected, onClick }) => (
    <button onClick={onClick} className={`px-5 py-2.5 text-base font-medium border rounded-lg transition-colors shadow-sm ${isSelected ? 'bg-cyan-500 text-slate-900 border-cyan-500' : 'bg-slate-800 text-gray-300 border-slate-600 hover:bg-slate-700'}`}>{label}</button>
);

const CheckboxGroup = ({ title, options, selectedOptions, onSelect }) => (
    <div>
        <label className="block text-lg font-medium text-gray-300 mb-3">{title}</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {options.map(option => (
                <div key={option} onClick={() => onSelect(option)} className={`flex items-center p-3 border rounded-lg cursor-pointer ${selectedOptions.includes(option) ? 'border-cyan-400 bg-slate-700' : 'border-slate-600 bg-slate-800'}`}>
                    <input type="checkbox" checked={selectedOptions.includes(option)} readOnly className="h-4 w-4 rounded bg-slate-600 border-gray-500 text-cyan-500 focus:ring-cyan-500"/>
                    <span className="ml-3 text-gray-300">{option}</span>
                </div>
            ))}
        </div>
    </div>
);

const EquipmentCategory = ({ category, examples, isSelected, onSelect }) => (
    <div onClick={onSelect} className={`p-5 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-cyan-400 bg-slate-700 ring-2 ring-cyan-400' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}>
        <div className="flex">
            <div className="flex items-center h-5"> <input type="checkbox" checked={isSelected} readOnly className="h-5 w-5 rounded border-gray-500 bg-slate-600 text-cyan-500 focus:ring-cyan-500" /> </div>
            <div className="ml-4 text-base">
                <label className="font-semibold text-gray-100">{category}</label>
                <p className="text-gray-400">{examples}</p>
            </div>
        </div>
    </div>
);

const SummaryItem = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-cyan-400">{label}</p>
        <p className="text-lg text-gray-200">{value}</p>
    </div>
);

// --- ONBOARDING & CHAT COMPONENTS ---
const Chat = ({ onBack }) => {
    // ... This component's logic is updated to use reCAPTCHA
    const [history, setHistory] = useState([{ sender: 'ai', text: 'Hello! I am FitnessForge AI. How can I help you today? You can ask me questions or upload a photo of your food for analysis.'}]);
    const [userInput, setUserInput] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setImageBase64(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(file);
    };
    
    const clearImage = () => {
        setImagePreview(null);
        setImageBase64(null);
        if(fileInputRef.current) fileInputRef.current.value = null;
    }

    const handleSendMessage = async () => {
        if (!userInput.trim() && !imageBase64) return;
        
        setIsLoading(true);

        grecaptcha.ready(function() {
            grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: 'submit'}).then(async function(token) {
                // This is the "Human Pass" token
                const newHistory = [...history, { sender: 'user', text: userInput, image: imagePreview }];
                setHistory(newHistory);
                
                const currentInput = userInput;
                const currentImage = imageBase64;
                
                setUserInput('');
                clearImage();

                const systemInstruction = "You are FitnessForge AI, a world-class, encouraging, and knowledgeable fitness and nutrition coach...";
                const aiResponseText = await callOurSecureAPI(systemInstruction, history, currentInput, currentImage, token);
                
                setHistory([...newHistory, { sender: 'ai', text: aiResponseText }]);
                setIsLoading(false);
            });
        });
    };
    // ... The rest of the Chat component's JSX is the same
    return (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg p-8 md:p-10 max-w-3xl mx-auto border border-slate-700">
            <h2 className="text-3xl font-semibold mb-4 text-center text-gray-100">AI Quick Chat</h2>
            <div className="h-96 bg-slate-900/50 rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto border border-slate-700">
                {history.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-600' : 'bg-slate-700'}`}>
                            {msg.image && <img src={msg.image} className="rounded-md mb-2 max-h-48" />}
                            <p className="text-base whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-slate-700">Typing...</div></div>}
            </div>
            {imagePreview && (<div className="mt-4 relative w-24"><img src={imagePreview} className="rounded-md" /><button onClick={clearImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">&times;</button></div>)}
            <div className="mt-4 flex">
                 <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="hidden" />
                <button onClick={() => fileInputRef.current.click()} className="px-4 py-3 bg-slate-700 text-gray-300 font-semibold rounded-l-lg hover:bg-slate-600"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
                <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Ask or add details to your photo..." className="flex-grow text-base px-4 py-3 bg-slate-800 border-t border-b border-slate-600 focus:ring-2 focus:ring-cyan-400 focus:outline-none"/>
                <button onClick={handleSendMessage} disabled={isLoading} className="px-6 py-3 bg-cyan-500 text-slate-900 font-semibold rounded-r-lg hover:bg-cyan-400 disabled:bg-slate-600">Send</button>
            </div>
            <div className="text-center mt-6">
                <button onClick={onBack} className="text-gray-400 hover:text-cyan-400">← Back to Home</button>
            </div>
        </div>
    );
};
        
const OnboardingForm = ({ onPlanGenerated }) => {
    // ... The OnboardingForm's logic is also updated to use reCAPTCHA
    const [step, setStep] = useState(1);
    const [unitSystem, setUnitSystem] = useState('Metric');
    const [formData, setFormData] = useState({ name: '', age: '', gender: 'Male', weight: '', height_cm: '', height_ft: '', height_in: '', goal: '', trainingLevel: 'Beginner', customGoal: '', workoutDays: '', workoutDuration: '', equipment: [], dietaryPattern: 'Omnivore', foodsToExclude: [], allergies: [], cuisinePreferences: [], wantsSupplements: 'Yes', wantsRecipes: 'Yes', dietaryNotes: '' });
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleMultiSelect = (type, value) => setFormData(p => ({ ...p, [type]: p[type].includes(value) ? p[type].filter(i => i !== value) : [...p[type], value] }));
    const handleCuisineSelect = (c) => setFormData(p => ({...p, cuisinePreferences: p.cuisinePreferences.includes(c) ? p.cuisinePreferences.filter(i => i !== c) : (p.cuisinePreferences.length < 3 ? [...p.cuisinePreferences, c] : p.cuisinePreferences)}));
    const handleGoalSelect = (goal) => setFormData(p => ({ ...p, goal }));
    const handleNext = () => setStep(p => p + 1);
    const handleBack = () => setStep(p => p - 1);
    const startOver = () => { setStep(1); setGeneratedPlan(null); setChatHistory([]); };
    const startChat = () => {
        const profileSummary = `Here is the user's profile:\n- Name: ${formData.name}\n- Age: ${formData.age}\n- ...`; // (shortened for brevity)
        setChatHistory([{ sender: 'system', text: profileSummary }, { sender: 'ai', text: `Hello ${formData.name.split(' ')[0]}! I've reviewed your detailed profile. To forge the perfect plan, please tell me a bit more in your own words about your primary goal of '${formData.goal}'. What does success look like to you?` }]);
        handleNext();
    };
    const returnToChatForEdits = () => {
        setChatHistory(prev => [...prev, { sender: 'ai', text: `Okay, what would you like to change about the plan I just generated?`}]);
        setStep(10);
    };
    const handleSendMessage = async () => {
        if (!userInput.trim()) return;
        setIsLoading(true);

        grecaptcha.ready(function() {
            grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: 'submit'}).then(async function(token) {
                const newHistory = [...chatHistory, { sender: 'user', text: userInput }];
                setChatHistory(newHistory);
                const currentInput = userInput;
                setUserInput('');
                const systemInstruction = "You are FitnessForge AI, a world-class fitness and nutrition coach...";
                const aiResponseText = await callOurSecureAPI(systemInstruction, chatHistory, currentInput, null, token);
                setGeneratedPlan({ rawText: aiResponseText });
                setChatHistory([...newHistory, { sender: 'ai', text: aiResponseText }]);
                setIsLoading(false);
            });
        });
    };
    const equipmentList = { 'Free Weights': 'Dumbbells, kettlebells.', 'Barbells & Racks': 'Barbell, squat rack, bench.', 'Strength Machines': 'Leg press, chest press, etc.', 'Cables & Pulleys': 'Cable crossover, functional trainer.', 'Functional & Conditioning': 'Ropes, boxes, sleds.', 'Bodyweight & Basics': 'Pull-up bar, bands, jump rope.', 'Cardio Equipment': 'Treadmill, bike, rower.' };
    const cuisines = ['American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'Greek', 'Spanish', 'French', 'Caribbean', 'Middle Eastern', 'Korean', 'Vietnamese', 'Tex-Mex', 'BBQ', 'Brazilian', 'Cajun', 'Soul Food'];
    const dietaryPatterns = ['Omnivore', 'Vegetarian', 'Vegan', 'Pescatarian', 'Paleo', 'Keto'];
    const foodsToExcludeOptions = ['Pork', 'Beef', 'Poultry', 'Fish & Seafood', 'Dairy', 'Eggs'];
    const allergiesOptions = ['Peanuts', 'Tree Nuts', 'Soy', 'Gluten', 'Shellfish', 'Wheat', 'Lactose Intolerance'];
    const trainingLevels = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
    return (
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg p-8 md:p-10 max-w-3xl mx-auto border border-slate-700">
            {step === 1 && <div><h2 className="text-3xl font-semibold mb-6 text-center text-gray-100">Welcome, legend! Let’s set up your profile.</h2><div className="space-y-5"><FormInput label="Full Name" type="text" placeholder="e.g., Alex Doe" name="name" value={formData.name} onChange={handleChange} /><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><FormInput label="Age" type="number" placeholder="e.g., 25" name="age" value={formData.age} onChange={handleChange} /><div><label className="block text-base font-medium text-gray-300 mb-2">Gender</label><select name="gender" value={formData.gender} onChange={handleChange} className="w-full text-base px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-400"><option>Male</option><option>Female</option><option>Other</option></select></div></div><div className="pt-2"><label className="block text-center text-base font-medium text-gray-300 mb-2">Unit System</label><div className="flex justify-center"><div className="inline-flex rounded-md shadow-sm"><button onClick={() => setUnitSystem('Metric')} className={`px-4 py-2 text-base font-medium border rounded-l-lg transition-colors ${unitSystem === 'Metric' ? 'bg-cyan-500 text-slate-900 border-cyan-500' : 'bg-slate-700 text-gray-300 border-slate-600'}`}>Metric</button><button onClick={() => setUnitSystem('Imperial')} className={`px-4 py-2 text-base font-medium border rounded-r-lg transition-colors ${unitSystem === 'Imperial' ? 'bg-cyan-500 text-slate-900 border-cyan-500' : 'bg-slate-700 text-gray-300 border-slate-600'}`}>Imperial</button></div></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-5"><FormInput label={`Weight (${unitSystem === 'Metric' ? 'kg' : 'lbs'})`} type="number" name="weight" value={formData.weight} onChange={handleChange} /><div className="flex space-x-2">{unitSystem === 'Metric' ? <FormInput label="Height (cm)" type="number" name="height_cm" value={formData.height_cm} onChange={handleChange} /> : <><FormInput label="Height (ft)" type="number" name="height_ft" value={formData.height_ft} onChange={handleChange} /><FormInput label="(in)" type="number" name="height_in" value={formData.height_in} onChange={handleChange} /></>}</div></div></div></div>}
            {step === 2 && <div><h2 className="text-3xl font-semibold mb-8 text-center text-gray-100">{`What's your primary goal, ${formData.name.split(' ')[0] || 'legend'}?`}</h2><div className="space-y-4"><GoalCard icon="💪" title="Build Muscle" description="Increase strength and muscle mass." isSelected={formData.goal === 'Build Muscle'} onSelect={() => handleGoalSelect('Build Muscle')} /><GoalCard icon="🔥" title="Lose Weight" description="Burn fat and get leaner." isSelected={formData.goal === 'Lose Weight'} onSelect={() => handleGoalSelect('Lose Weight')} /><GoalCard icon="🏋️" title="Build Strength" description="Increase raw power and lift heavier." isSelected={formData.goal === 'Build Strength'} onSelect={() => handleGoalSelect('Build Strength')} /><GoalCard icon="⚡️" title="Improve Athleticism" description="Enhance speed, agility, and power." isSelected={formData.goal === 'Improve Athleticism'} onSelect={() => handleGoalSelect('Improve Athleticism')} /><GoalCard icon="❤️" title="Maintain Fitness" description="Stay active and maintain your current level." isSelected={formData.goal === 'Maintain Fitness'} onSelect={() => handleGoalSelect('Maintain Fitness')} /><GoalCard icon="✏️" title="Custom Goal" description="Describe your specific fitness objective." isSelected={formData.goal === 'Custom'} onSelect={() => handleGoalSelect('Custom')} />{formData.goal === 'Custom' && (<div className="pt-2"><textarea name="customGoal" value={formData.customGoal} onChange={handleChange} placeholder="e.g., I want to build muscle and also get leaner..." className="w-full text-base h-24 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 placeholder-gray-500"></textarea></div>)}</div></div>}
            {step === 3 && <div><h2 className="text-3xl font-semibold mb-8 text-center text-gray-100">What's your training experience?</h2><div className="flex flex-wrap justify-center gap-3">{trainingLevels.map(level => <SelectionButton key={level} label={level} isSelected={formData.trainingLevel === level} onClick={() => setFormData(p => ({ ...p, trainingLevel: level }))} />)}</div></div>}
            {step === 4 && <div><h2 className="text-3xl font-semibold mb-8 text-center text-gray-100">How often can you train?</h2><div className="space-y-8"><div><label className="block text-base font-medium text-gray-300 mb-3 text-center">Days per week</label><div className="flex flex-wrap justify-center gap-3">{[2, 3, 4, 5, 6].map(day => (<SelectionButton key={day} label={`${day} days`} isSelected={formData.workoutDays === `${day}`} onClick={() => setFormData(p => ({ ...p, workoutDays: `${day}`}))} />))}</div></div><div><label className="block text-base font-medium text-gray-300 mb-3 text-center">Session duration</label><div className="flex flex-wrap justify-center gap-3">{['30-45 min', '45-60 min', '60-90 min'].map(duration => (<SelectionButton key={duration} label={duration} isSelected={formData.workoutDuration === duration} onClick={() => setFormData(p => ({ ...p, workoutDuration: duration}))} />))}</div></div></div></div>}
            {step === 5 && <div><h2 className="text-3xl font-semibold mb-8 text-center text-gray-100">What equipment do you have?</h2><div className="space-y-4">{Object.entries(equipmentList).map(([c, e]) => <EquipmentCategory key={c} category={c} examples={e} isSelected={formData.equipment.includes(c)} onSelect={() => handleMultiSelect('equipment', c)} />)}</div></div>}
            {step === 6 && <div><h2 className="text-3xl font-semibold mb-8 text-center text-gray-100">Let's talk nutrition.</h2><div className="space-y-8"><div><label className="block text-lg font-medium text-gray-300 mb-3">Dietary pattern?</label><div className="flex flex-wrap gap-3">{dietaryPatterns.map(p => <SelectionButton key={p} label={p} isSelected={formData.dietaryPattern === p} onClick={() => setFormData(s => ({...s, dietaryPattern: p}))} />)}</div></div><CheckboxGroup title="Foods to exclude?" options={foodsToExcludeOptions} selectedOptions={formData.foodsToExclude} onSelect={v => handleMultiSelect('foodsToExclude', v)} /><CheckboxGroup title="Any allergies?" options={allergiesOptions} selectedOptions={formData.allergies} onSelect={v => handleMultiSelect('allergies', v)} /></div></div>}
            {step === 7 && <div><h2 className="text-3xl font-semibold mb-2 text-center text-gray-100">Favorite cuisines?</h2><p className="text-center text-gray-400 mb-6">Select up to 3.</p><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{cuisines.map(c => <SelectionButton key={c} label={c} isSelected={formData.cuisinePreferences.includes(c)} onClick={() => handleCuisineSelect(c)} />)}</div></div>}
            {step === 8 && <div><h2 className="text-3xl font-semibold mb-8 text-center text-gray-100">Final Details</h2><div className="space-y-8"><div><label className="block text-lg font-medium text-gray-300 mb-3">Use supplements?</label><div className="flex gap-3"><SelectionButton label="Yes" isSelected={formData.wantsSupplements === 'Yes'} onClick={() => setFormData(p=>({...p, wantsSupplements: 'Yes'}))} /><SelectionButton label="No" isSelected={formData.wantsSupplements === 'No'} onClick={() => setFormData(p=>({...p, wantsSupplements: 'No'}))} /></div></div><div><label className="block text-lg font-medium text-gray-300 mb-3">Include recipes?</label><div className="flex gap-3"><SelectionButton label="Yes, please!" isSelected={formData.wantsRecipes === 'Yes'} onClick={() => setFormData(p=>({...p, wantsRecipes: 'Yes'}))} /><SelectionButton label="No, just food list" isSelected={formData.wantsRecipes === 'No'} onClick={() => setFormData(p=>({...p, wantsRecipes: 'No'}))} /></div></div><div><label className="block text-lg font-medium text-gray-300 mb-2">Other dietary notes?</label><textarea name="dietaryNotes" value={formData.dietaryNotes} onChange={handleChange} rows="3" className="w-full text-base px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-400"></textarea></div></div></div>}
            {step === 9 && <div><h2 className="text-3xl font-semibold mb-6 text-center text-gray-100">Your Complete Profile</h2><div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-slate-900/50 p-6 rounded-lg border border-slate-700"><SummaryItem label="Name" value={formData.name} /><SummaryItem label="Age" value={formData.age} /><SummaryItem label="Goal" value={formData.goal} /><SummaryItem label="Experience" value={formData.trainingLevel} /><SummaryItem label="Workout Days" value={`${formData.workoutDays}/week`} /><SummaryItem label="Equipment" value={formData.equipment.length > 0 ? 'Yes' : 'No'} /></div></div>}
            {step === 10 && <div><h2 className="text-3xl font-semibold mb-4 text-center text-gray-100">AI Plan Forging</h2><div className="h-96 bg-slate-900/50 rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto border border-slate-700">{chatHistory.map((msg, i) => <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-600' : 'bg-slate-700'}`}><p className="text-base whitespace-pre-wrap">{msg.text}</p></div></div>)}{isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-slate-700">Typing...</div></div>}</div><div className="mt-4 flex"><input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Tell the AI more..." className="flex-grow text-base px-4 py-3 bg-slate-800 border border-slate-600 rounded-l-lg focus:ring-2 focus:ring-cyan-400"/><button onClick={handleSendMessage} disabled={isLoading} className="px-6 py-3 bg-cyan-500 text-slate-900 font-semibold rounded-r-lg hover:bg-cyan-400 disabled:bg-slate-600">Send</button></div><div className="text-center mt-4"><button onClick={() => setStep(11)} disabled={!generatedPlan} className="px-8 py-3 bg-orange-500 text-slate-900 font-semibold rounded-lg shadow-md hover:bg-orange-400 disabled:bg-slate-700 disabled:text-gray-400">Done - View Final Plan</button></div></div>}
            {step === 11 && <div><h2 className="text-3xl font-semibold mb-6 text-center text-gray-100">Your Forged Plan</h2>{generatedPlan && <div className="space-y-8"><div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700"><h3 className="text-2xl font-bold text-cyan-400 mb-4">Workout Plan</h3><p className="text-base whitespace-pre-wrap">{generatedPlan.rawText}</p></div></div>}<div className="text-center pt-8 mt-8 border-t border-slate-700 flex justify-center gap-4"><button onClick={startOver} className="px-8 py-3 bg-slate-700 text-gray-300 font-semibold rounded-lg shadow-md hover:bg-slate-600">Start a New Plan</button><button onClick={returnToChatForEdits} className="px-8 py-3 bg-cyan-500 text-slate-900 font-semibold rounded-lg shadow-md hover:bg-cyan-400">Modify with AI</button></div></div>}

            {step < 11 && (
                <div className="flex justify-between pt-8 mt-8 border-t border-slate-700">
                    {step > 1 ? <button onClick={handleBack} className="px-8 py-3 bg-slate-700 text-gray-300 font-semibold rounded-lg shadow-md hover:bg-slate-600">Back</button> : <a href="#" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="text-gray-400 hover:text-cyan-400">← Back to Home</a>}
                    <button onClick={step === 9 ? startChat : handleNext} className="px-8 py-3 bg-cyan-500 text-slate-900 font-semibold rounded-lg shadow-md hover:bg-cyan-400">{step === 9 ? 'Confirm & Start Forging' : 'Next'}</button>
                </div>
            )}
        </div>
    );
};

// --- Rendering the App ---
const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
}

