import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Volume2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  Loader2,
  Languages,
  Award,
  BookMarked,
  Lightbulb,
} from 'lucide-react';
import { api } from '../../api';

interface LanguageStudyHubProps {
  onSaveAsProject?: (projectData: { title: string; language: string; grade: string }) => void;
}

export const PRESET_LANGUAGES = [
  { id: 'en', name: 'English', flag: '🇬🇧', speechLang: 'en-US' },
  { id: 'fr', name: 'Français', flag: '🇫🇷', speechLang: 'fr-FR' },
  { id: 'es', name: 'Español', flag: '🇪🇸', speechLang: 'es-ES' },
  { id: 'de', name: 'Deutsch', flag: '🇩🇪', speechLang: 'de-DE' },
  { id: 'it', name: 'Italiano', flag: '🇮🇹', speechLang: 'it-IT' },
  { id: 'pt', name: 'Português', flag: '🇵🇹', speechLang: 'pt-PT' },
  { id: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦', speechLang: 'ar-SA' },
  { id: 'zh', name: '中文 (Chinese)', flag: '🇨🇳', speechLang: 'zh-CN' },
  { id: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵', speechLang: 'ja-JP' },
  { id: 'ko', name: '한국어 (Korean)', flag: '🇰🇷', speechLang: 'ko-KR' },
  { id: 'ru', name: 'Русский', flag: '🇷🇺', speechLang: 'ru-RU' },
  { id: 'tr', name: 'Türkçe', flag: '🇹🇷', speechLang: 'tr-TR' },
  { id: 'nl', name: 'Nederlands', flag: '🇳🇱', speechLang: 'nl-NL' },
];

export const GRADE_LEVELS = [
  { id: 'grade_1', name: '1st Grade (Primary)', desc: 'Alphabet, phonetics & basic sight words' },
  { id: 'grade_2', name: '2nd Grade', desc: 'Simple everyday nouns, verbs & basic sentences' },
  { id: 'grade_3', name: '3rd Grade', desc: 'Descriptive adjectives, plural forms & simple reading' },
  { id: 'grade_4', name: '4th Grade', desc: 'Past & future tenses, basic conjunctions' },
  { id: 'grade_5', name: '5th Grade', desc: 'Intermediate vocabulary, pronouns & comprehension' },
  { id: 'grade_6', name: '6th Grade (Middle School)', desc: 'Compound sentences, irregular verbs & dialogue' },
  { id: 'grade_7', name: '7th Grade', desc: 'Direct & indirect speech, conditional structures' },
  { id: 'grade_8', name: '8th Grade', desc: 'Subjunctive introduction, idioms & essay syntax' },
  { id: 'grade_9', name: '9th Grade (High School)', desc: 'Complex texts, literature analysis & stylistic devices' },
  { id: 'grade_10', name: '10th Grade', desc: 'Formal vs informal registers, debate & rhetoric' },
  { id: 'grade_11', name: '11th Grade', desc: 'Advanced syntactic nuance & cultural idioms' },
  { id: 'grade_12', name: '12th Grade (Baccalaureate)', desc: 'Full academic fluency, argumentation & synthesis' },
  { id: 'college', name: 'College / University', desc: 'Technical vocabulary, research papers & professional discourse' },
  { id: 'adult', name: 'Adult Fluency / Professional', desc: 'Business communication & conversational mastery' },
];

// Rich vocabulary sets per language and grade category
const CURRICULUM_DATA: Record<string, Record<string, Array<{ word: string; phonetic: string; translation: string; example: string }>>> = {
  fr: {
    grade_1: [
      { word: 'Bonjour', phonetic: '/bɔ̃.ʒuʁ/', translation: 'Hello / Good morning', example: 'Bonjour, comment allez-vous ?' },
      { word: 'Merci', phonetic: '/mɛʁ.si/', translation: 'Thank you', example: 'Merci beaucoup pour votre aide.' },
      { word: 'Le chat', phonetic: '/lə ʃa/', translation: 'The cat', example: 'Le chat dort sur le canapé.' },
      { word: 'L’école', phonetic: '/l‿e.kɔl/', translation: 'The school', example: 'Je vais à l’école tous les matins.' },
      { word: 'Un ami', phonetic: '/œ̃n‿a.mi/', translation: 'A friend', example: 'Alex est un très bon ami.' },
    ],
    grade_6: [
      { word: 'Découvrir', phonetic: '/de.ku.vʁiʁ/', translation: 'To discover', example: 'Nous voulons découvrir de nouveaux horizons.' },
      { word: 'Cependant', phonetic: '/sə.pɑ̃.dɑ̃/', translation: 'However / Nevertheless', example: 'Il pleut, cependant nous sortons.' },
      { word: 'L’environnement', phonetic: '/l‿ɑ̃.vi.ʁɔn.mɑ̃/', translation: 'The environment', example: 'Il faut protéger l’environnement.' },
      { word: 'Réussir', phonetic: '/ʁe.y.siʁ/', translation: 'To succeed', example: 'Avec de la persévérance, vous allez réussir.' },
    ],
    grade_12: [
      { word: 'Inéluctable', phonetic: '/i.ne.lyk.tabl/', translation: 'Inevitable', example: 'Le progrès technologique semble inéluctable.' },
      { word: 'Éloquence', phonetic: '/e.lɔ.kɑ̃s/', translation: 'Eloquence', example: 'Son discours brillait par son éloquence.' },
      { word: 'Corroborer', phonetic: '/kɔ.ʁɔ.bɔ.ʁe/', translation: 'To corroborate / confirm', example: 'Les données viennent corroborer cette hypothèse.' },
      { word: 'Paradigme', phonetic: '/pa.ʁa.diɡm/', translation: 'Paradigm', example: 'Ce modèle propose un nouveau paradigme.' },
    ],
  },
  es: {
    grade_1: [
      { word: 'Hola', phonetic: '/ˈo.la/', translation: 'Hello', example: '¡Hola! ¿Cómo estás hoy?' },
      { word: 'Gracias', phonetic: '/ˈɡɾa.sjas/', translation: 'Thank you', example: 'Muchas gracias por tu ayuda.' },
      { word: 'La casa', phonetic: '/la ˈka.sa/', translation: 'The house', example: 'La casa es grande y hermosa.' },
      { word: 'El libro', phonetic: '/el ˈli.βɾo/', translation: 'The book', example: 'Leo el libro con atención.' },
    ],
    grade_6: [
      { word: 'Desarrollo', phonetic: '/de.saˈro.ʎo/', translation: 'Development', example: 'El desarrollo de habilidades es vital.' },
      { word: 'Sin embargo', phonetic: '/sin emˈbaɾ.ɣo/', translation: 'However', example: 'Estudió mucho; sin embargo, no fue fácil.' },
      { word: 'Compromiso', phonetic: '/kom.pɾoˈmi.so/', translation: 'Commitment', example: 'Tenemos un compromiso con la excelencia.' },
    ],
    grade_12: [
      { word: 'Imprescindible', phonetic: '/im.pɾe.sinˈdi.βle/', translation: 'Essential / Indispensable', example: 'La cooperación es imprescindible.' },
      { word: 'Idiosincrasia', phonetic: '/i.djo.sinˈkɾa.sja/', translation: 'Idiosyncrasy', example: 'Refleja la idiosincrasia de la región.' },
      { word: 'Vanguardia', phonetic: '/baŋˈɡwaɾ.dja/', translation: 'Avant-garde / Forefront', example: 'Una propuesta estética de vanguardia.' },
    ],
  },
  ar: {
    grade_1: [
      { word: 'مَرْحَبًا (Marhaban)', phonetic: '/mar.ħa.ban/', translation: 'Hello', example: 'مَرْحَبًا بِكُمْ جَمِيعًا.' },
      { word: 'شُكْرًا (Shukran)', phonetic: '/ʃuk.ran/', translation: 'Thank you', example: 'شُكْرًا جَزِيلاً لَكَ.' },
      { word: 'كِتَابٌ (Kitab)', phonetic: '/ki.taːb/', translation: 'Book', example: 'هَذَا كِتَابٌ مُفِيدٌ جِدًّا.' },
      { word: 'مَدْرَسَةٌ (Madrasa)', phonetic: '/mad.ra.sa/', translation: 'School', example: 'المَدْرَسَةُ بَيْتُ العِلْمِ.' },
    ],
    grade_12: [
      { word: 'عَبْقَرِيَّة (Abqariyya)', phonetic: '/ʕab.qa.rij.ja/', translation: 'Genius / Brilliance', example: 'تَمَيَّزَ الكَاتِبُ بِعَبْقَرِيَّةٍ فَرِيدَةٍ.' },
      { word: 'اسْتِرَاتِيجِيَّة (Istratijiyya)', phonetic: '/is.ti.raː.tiː.dʒij.ja/', translation: 'Strategy', example: 'وَضَعَ الفَرِيقُ اسْتِرَاتِيجِيَّةً مُحْكَمَةً.' },
      { word: 'بَلَاغَة (Balagha)', phonetic: '/ba.laː.ɣa/', translation: 'Rhetoric / Eloquence', example: 'تَتَجَلَّى بَلَاغَةُ النَّصِّ فِي بَيَانِهِ.' },
    ],
  },
  en: {
    grade_1: [
      { word: 'Welcome', phonetic: '/ˈwɛl.kəm/', translation: 'Bienvenue', example: 'Welcome to our collaborative team.' },
      { word: 'Learn', phonetic: '/lɜːrn/', translation: 'Apprendre', example: 'We learn something new every day.' },
      { word: 'Friend', phonetic: '/frɛnd/', translation: 'Ami(e)', example: 'A good friend is always supportive.' },
    ],
    grade_12: [
      { word: 'Ubiquitous', phonetic: '/juːˈbɪk.wɪ.təs/', translation: 'Omniprésent', example: 'Smartphones have become ubiquitous in modern life.' },
      { word: 'Pragmatic', phonetic: '/præɡˈmæt.ɪk/', translation: 'Pragmatique', example: 'We need a pragmatic approach to solve this challenge.' },
      { word: 'Eloquent', phonetic: '/ˈɛl.ə.kwənt/', translation: 'Éloquent', example: 'She delivered an eloquent keynote address.' },
    ],
  },
};

export const LanguageStudyHub: React.FC<LanguageStudyHubProps> = ({ onSaveAsProject }) => {
  const [selectedLang, setSelectedLang] = useState('fr');
  const [customLangInput, setCustomLangInput] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('grade_6');
  const [activeTab, setActiveTab] = useState<'FLASHCARDS' | 'GRAMMAR' | 'QUIZ' | 'AI_TUTOR'>('FLASHCARDS');

  // Flashcard State
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz State
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // AI Tutor State
  const [tutorQuery, setTutorQuery] = useState('');
  const [tutorHistory, setTutorHistory] = useState<Array<{ sender: 'USER' | 'TUTOR'; text: string }>>([
    {
      sender: 'TUTOR',
      text: 'Hello! I am your AI Language Tutor. Choose your language and grade level, and I will generate grammar exercises, explain expressions, and help you practice conversations!',
    },
  ]);
  const [tutorLoading, setTutorLoading] = useState(false);

  // Current language object
  const currentLangObj =
    PRESET_LANGUAGES.find((l) => l.id === selectedLang) || {
      id: 'custom',
      name: customLangInput || 'Selected Language',
      flag: '🌐',
      speechLang: 'en-US',
    };

  const currentGradeObj =
    GRADE_LEVELS.find((g) => g.id === selectedGrade) || GRADE_LEVELS[5];

  // Resolve flashcard data
  const currentCards =
    (CURRICULUM_DATA[selectedLang] && (CURRICULUM_DATA[selectedLang][selectedGrade] || CURRICULUM_DATA[selectedLang].grade_1)) || [
      {
        word: `Vocabulary (${currentLangObj.name})`,
        phonetic: '/praksis/',
        translation: `Level: ${currentGradeObj.name}`,
        example: `Practicing ${currentLangObj.name} sentences for ${currentGradeObj.name}.`,
      },
      {
        word: 'Communication',
        phonetic: '/kəˌmjuː.nɪˈkeɪ.ʃən/',
        translation: 'Dialogue & Interaction',
        example: 'Effective communication builds stronger teams.',
      },
    ];

  const currentCard = currentCards[cardIndex % currentCards.length];

  // Text-To-Speech Pronunciation
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLangObj.speechLang;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {}
  };

  const handleAskTutor = async (promptText?: string) => {
    const q = (promptText || tutorQuery).trim();
    if (!q || tutorLoading) return;

    setTutorQuery('');
    setTutorHistory((prev) => [...prev, { sender: 'USER', text: q }]);
    setTutorLoading(true);

    try {
      const res = await api.askWorkAgent({
        userPrompt: `[Language Study Session: ${currentLangObj.name}, Grade: ${currentGradeObj.name}] User question: ${q}`,
        workContext: {
          title: `Study ${currentLangObj.name} (${currentGradeObj.name})`,
          category: 'Study',
        },
      });

      setTutorHistory((prev) => [
        ...prev,
        {
          sender: 'TUTOR',
          text: res.reply || 'Great question! Practice makes perfect.',
        },
      ]);
    } catch (err: any) {
      setTutorHistory((prev) => [
        ...prev,
        {
          sender: 'TUTOR',
          text: `Exercice pratique pour ${currentLangObj.name} (${currentGradeObj.name}) : Révisez la conjugaison et la grammaire fondamentale.`,
        },
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shadow-xs shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">
                Hub d'Étude des Langues & Niveaux Scolaires
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                Interactive Learning
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Étudiez n'importe quelle langue du monde et choisissez votre niveau scolaire de la 1ère année à l'université.
            </p>
          </div>
        </div>

        {onSaveAsProject && (
          <button
            onClick={() =>
              onSaveAsProject({
                title: `Étude : ${currentLangObj.name} (${currentGradeObj.name})`,
                language: currentLangObj.name,
                grade: currentGradeObj.name,
              })
            }
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-center"
          >
            Enregistrer ce projet d'étude
          </button>
        )}
      </div>

      {/* 1. LANGUAGE SELECTOR (Select whatever language) */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-zinc-700 flex items-center gap-2">
          <Languages className="w-3.5 h-3.5 text-teal-600" />
          <span>1. Choisissez la langue que vous souhaitez étudier :</span>
        </label>

        {/* Preset Language Chips */}
        <div className="flex flex-wrap gap-2">
          {PRESET_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.id;
            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => {
                  setSelectedLang(lang.id);
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs scale-105'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-transparent'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Language input for ANY other language */}
        <div className="flex items-center gap-2 pt-1 max-w-md">
          <input
            type="text"
            placeholder="Autre langue (ex: Suédois, Grec, Polonais, Hindi...)"
            value={customLangInput}
            onChange={(e) => {
              setCustomLangInput(e.target.value);
              setSelectedLang('custom');
            }}
            className="flex-1 px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-300 focus:bg-white"
          />
          {customLangInput && (
            <span className="text-xs font-bold text-teal-700">Langue active</span>
          )}
        </div>
      </div>

      {/* 2. GRADE SELECTOR (Choose your grade) */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold text-zinc-700 flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-teal-600" />
          <span>2. Choisissez votre niveau scolaire ou académique (Grade) :</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {GRADE_LEVELS.map((grade) => {
            const isSelected = selectedGrade === grade.id;
            return (
              <button
                key={grade.id}
                type="button"
                onClick={() => {
                  setSelectedGrade(grade.id);
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-bold shadow-xs'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700'
                }`}
              >
                <div className="text-xs font-bold truncate">{grade.name}</div>
                <div className="text-[10px] text-zinc-400 truncate mt-0.5">{grade.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. STUDY MODULE TABS */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 overflow-x-auto">
        {[
          { id: 'FLASHCARDS', label: '🗂️ Cartes de Vocabulaire & Audio' },
          { id: 'GRAMMAR', label: '📖 Règles de Grammaire & Syntaxe' },
          { id: 'QUIZ', label: '✍️ Quiz Pratique Interactif' },
          { id: 'AI_TUTOR', label: '🤖 Tuteur IA & Conversation' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT 1: FLASHCARDS */}
      {activeTab === 'FLASHCARDS' && (
        <div className="max-w-md mx-auto space-y-4 text-center py-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[220px] p-8 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-xl cursor-pointer flex flex-col items-center justify-center relative select-none transition-transform hover:scale-[1.01]"
          >
            <span className="absolute top-4 left-4 text-[10px] font-bold text-teal-400 uppercase tracking-widest">
              {currentLangObj.flag} {currentLangObj.name} • {currentGradeObj.name}
            </span>

            <span className="absolute top-4 right-4 text-[10px] text-zinc-500">
              Carte {(cardIndex % currentCards.length) + 1} / {currentCards.length}
            </span>

            {!isFlipped ? (
              <div className="space-y-2 animate-in fade-in">
                <h3 className="text-3xl font-black tracking-tight">{currentCard.word}</h3>
                <p className="text-xs text-teal-400 font-mono">{currentCard.phonetic}</p>
                <p className="text-[11px] text-zinc-400 pt-3">
                  (Cliquez pour retourner et voir la traduction)
                </p>
              </div>
            ) : (
              <div className="space-y-3 animate-in zoom-in-95">
                <div className="text-xs text-teal-400 font-bold uppercase tracking-wider">Traduction</div>
                <h4 className="text-2xl font-black text-white">{currentCard.translation}</h4>
                <div className="p-3 bg-zinc-800/80 rounded-xl border border-zinc-700 text-xs text-zinc-300 italic">
                  « {currentCard.example} »
                </div>
              </div>
            )}
          </div>

          {/* Flashcard Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setCardIndex((prev) => (prev > 0 ? prev - 1 : currentCards.length - 1));
                setIsFlipped(false);
              }}
              className="p-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl transition-colors"
              title="Précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleSpeak(currentCard.word)}
              className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs"
              title="Écouter la prononciation audio"
            >
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span>Prononciation Audio</span>
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="p-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-2xl transition-colors"
              title="Retourner la carte"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setCardIndex((prev) => prev + 1);
                setIsFlipped(false);
              }}
              className="p-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl transition-colors shadow-xs"
              title="Suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: GRAMMAR GUIDE */}
      {activeTab === 'GRAMMAR' && (
        <div className="space-y-4 max-w-2xl mx-auto py-2">
          <div className="p-5 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-teal-950 flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-teal-700" />
              <span>Règles Essentielles : {currentLangObj.name} ({currentGradeObj.name})</span>
            </h3>
            <p className="text-xs text-teal-900 leading-relaxed">
              Consignes d'apprentissage adaptées à votre niveau sélectionné : structuration des phrases, accords en genre et en nombre, conjugaisons régulières et irrégulières.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
              <h4 className="text-xs font-bold text-zinc-900">1. Structure de la Phrase</h4>
              <p className="text-[11px] text-zinc-600 leading-normal">
                Ordre canonique : Sujet + Verbe + Complément (SVO). En interrogatif, inversion du sujet ou ajout d'un pronom interrogatif.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
              <h4 className="text-xs font-bold text-zinc-900">2. Conjugaison & Temps Clés</h4>
              <p className="text-[11px] text-zinc-600 leading-normal">
                Maîtrise du Présent, Passé Composé / Prétérit et Futur simple. Attention aux verbes auxiliaires et participes passés.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
              <h4 className="text-xs font-bold text-zinc-900">3. Connecteurs Logiques</h4>
              <p className="text-[11px] text-zinc-600 leading-normal">
                Enrichissez vos paragraphes : car, donc, cependant, ainsi que, en conclusion, d'une part / d'autre part.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
              <h4 className="text-xs font-bold text-zinc-900">4. Pratique de l'Élocution</h4>
              <p className="text-[11px] text-zinc-600 leading-normal">
                Lisez à voix haute 10 minutes chaque jour pour ancrer les liaisons phonétiques et le rythme naturel de la langue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: INTERACTIVE QUIZ */}
      {activeTab === 'QUIZ' && (
        <div className="max-w-md mx-auto py-2 space-y-4">
          <div className="p-5 bg-white border border-zinc-200 rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold">
              <span>Question Pratique • Niveau {currentGradeObj.name}</span>
              <span className="text-teal-700 font-bold">Score : {quizScore} pts</span>
            </div>

            <h3 className="text-sm font-extrabold text-zinc-900">
              Quelle est la traduction correcte de « {currentCard.word} » en contexte ?
            </h3>

            <div className="space-y-2">
              {[
                currentCard.translation,
                'Une option incorrecte de test',
                'Un mot alternatif non vérifié',
              ].map((opt, oIdx) => {
                const isSelected = quizAnswer === oIdx;
                const isCorrect = oIdx === 0;

                return (
                  <button
                    key={oIdx}
                    onClick={() => {
                      setQuizAnswer(oIdx);
                      if (isCorrect && quizAnswer === null) {
                        setQuizScore((prev) => prev + 10);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                          : 'bg-red-50 border-red-500 text-red-900'
                        : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                  </button>
                );
              })}
            </div>

            {quizAnswer !== null && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setCardIndex((prev) => prev + 1);
                    setQuizAnswer(null);
                  }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  Question Suivante →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: AI TUTOR & CONVERSATION */}
      {activeTab === 'AI_TUTOR' && (
        <div className="space-y-4 max-w-2xl mx-auto py-2">
          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2">
            {[
              `Explique la grammaire de base en ${currentLangObj.name}`,
              `Donne 3 phrases types pour le niveau ${currentGradeObj.name}`,
              `Corrige mes fautes de conjugaison`,
              `Simule un dialogue d'apprentissage`,
            ].map((prompt, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleAskTutor(prompt)}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-[11px] font-semibold text-zinc-700 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-teal-600" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          {/* Dialogue Log */}
          <div className="h-64 overflow-y-auto p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
            {tutorHistory.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                  item.sender === 'USER'
                    ? 'ml-auto bg-zinc-900 text-white rounded-br-xs'
                    : 'mr-auto bg-white border border-zinc-200 text-zinc-900 rounded-bl-xs shadow-2xs whitespace-pre-wrap'
                }`}
              >
                {item.text}
              </div>
            ))}
            {tutorLoading && (
              <div className="p-3 rounded-2xl bg-white border border-zinc-200 text-zinc-400 text-xs flex items-center gap-2 max-w-[50%]">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span>Le Tuteur IA réfléchit...</span>
              </div>
            )}
          </div>

          {/* Tutor Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskTutor();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Posez une question sur le ${currentLangObj.name} (${currentGradeObj.name})...`}
              value={tutorQuery}
              onChange={(e) => setTutorQuery(e.target.value)}
              disabled={tutorLoading}
              className="flex-1 px-4 py-2.5 bg-zinc-100 border border-transparent rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:border-zinc-300 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!tutorQuery.trim() || tutorLoading}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
