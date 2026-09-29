import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Bot,
  Globe,
  Upload,
  Share2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode,
  FileSpreadsheet,
  FileText,
  FileVideo,
  FileAudio,
  Palette,
  Layers,
  Sparkles,
  Send,
  ExternalLink,
  ChevronRight,
  Shield,
  Eye,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { WorkProject, User, WorkCategory } from '../types';
import { api } from '../api';
import { WebsiteBuilder } from '../components/WebsiteBuilder';
import { LanguageStudyHub } from '../components/study/LanguageStudyHub';

const WORK_CATEGORIES: WorkCategory[] = [
  'Study',
  'Coding',
  'Websites',
  'Spreadsheets',
  'Documents',
  'Presentations',
  'Data Analysis',
  'Graphic Design',
  'UI/UX Design',
  'Product Management',
  'Marketing Campaigns',
  'Copywriting',
  'Video Editing',
  'Audio & Podcasts',
  'Customer Support',
  'Legal & Compliance',
];

interface WorkViewProps {
  workProjects: WorkProject[];
  currentUser: User;
  onRefresh: () => void;
}

export const WorkView: React.FC<WorkViewProps> = ({
  workProjects,
  currentUser,
  onRefresh,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeProject, setActiveProject] = useState<WorkProject | null>(null);
  const [inWebsiteBuilder, setInWebsiteBuilder] = useState(false);
  const [showStudyHubModal, setShowStudyHubModal] = useState(false);

  // Create Project Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<WorkCategory>('Websites');
  const [newDescription, setNewDescription] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // AI Copilot state for selected project
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<
    Array<{ sender: 'USER' | 'AGENT'; text: string; timestamp: string }>
  >([]);

  // File upload simulation state
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('application/json');

  // Share state
  const [shareUsername, setShareUsername] = useState('');
  const [sharePermission, setSharePermission] = useState<'VIEW' | 'EDIT' | 'ADMIN'>('EDIT');

  const [loadingAction, setLoadingAction] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    setActionMessage(null);
    try {
      const res = await api.createWork({
        title: newTitle,
        category: newCategory,
        description: newDescription,
        notes: newNotes,
        status: 'IN_PROGRESS',
      });
      setNewTitle('');
      setNewDescription('');
      setNewNotes('');
      setShowCreateModal(false);
      onRefresh();
      setActiveProject(res.work);
      if (res.work.category === 'Websites') {
        setInWebsiteBuilder(true);
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to create work project.' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAskAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || !activeProject || aiLoading) return;

    const userText = aiPrompt.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAiPrompt('');
    setAiChatHistory((prev) => [...prev, { sender: 'USER', text: userText, timestamp: time }]);
    setAiLoading(true);

    try {
      const res = await api.askWorkAgent({
        userPrompt: userText,
        workContext: {
          title: activeProject.title || activeProject.name,
          category: activeProject.category,
          description: activeProject.description,
          status: activeProject.status,
          notes: activeProject.notes,
        },
        conversationHistory: aiChatHistory,
      });

      setAiChatHistory((prev) => [
        ...prev,
        {
          sender: 'AGENT',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setAiChatHistory((prev) => [
        ...prev,
        {
          sender: 'AGENT',
          text: `Error connecting to AI Work Agent: ${err.message || 'Check connection'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !uploadFileName.trim()) return;
    setLoadingAction(true);
    try {
      const res = await api.addWorkFile(activeProject.id, {
        name: uploadFileName.trim(),
        fileType: uploadFileType,
        sizeBytes: 1024 * Math.floor(Math.random() * 400 + 50),
      });
      setActiveProject(res.work);
      setUploadFileName('');
      setActionMessage({ type: 'success', text: 'File attached to work project!' });
      onRefresh();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to attach file.' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleShareWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !shareUsername.trim()) return;
    setLoadingAction(true);
    try {
      const res = await api.shareWork(activeProject.id, {
        targetUsername: shareUsername.trim(),
        permission: sharePermission,
      });
      setActiveProject(res.work);
      setShareUsername('');
      setActionMessage({ type: 'success', text: `Project shared with @${shareUsername.trim()}!` });
      onRefresh();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to share project.' });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteWork = async (workId: string) => {
    if (!window.confirm('Delete this work project and all its attached assets?')) return;
    try {
      await api.deleteWork(workId);
      setActiveProject(null);
      setInWebsiteBuilder(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete work project.');
    }
  };

  const filteredProjects = workProjects.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    return p.category === selectedCategory;
  });

  // Render Full Website Builder if opened
  if (inWebsiteBuilder && activeProject) {
    return (
      <WebsiteBuilder
        work={activeProject}
        currentUser={currentUser}
        onBack={() => setInWebsiteBuilder(false)}
        onUpdateWork={(updated) => {
          setActiveProject(updated);
          onRefresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">WORK Studio</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
              16 Categories (Inc. Study)
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Create, manage deliverables, study French, Math & Arabic, build live websites, and collaborate with autonomous AI Work Agents.
          </p>
        </div>

        <button
          onClick={() => {
            setActionMessage(null);
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Work Project</span>
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'ALL'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900'
          }`}
        >
          All ({workProjects.length})
        </button>

        {WORK_CATEGORIES.map((cat) => {
          const count = workProjects.filter((p) => p.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <span>{cat}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-teal-500 text-white' : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* If Study category is selected: Full interactive Language & Grade Study Hub */}
      {selectedCategory === 'Study' && (
        <div className="mb-6 animate-in fade-in duration-200">
          <LanguageStudyHub
            onSaveAsProject={async ({ title, language, grade }) => {
              try {
                const res = await api.createWork({
                  title: `${title} (${language} - ${grade})`,
                  category: 'Study',
                  description: `Interactive language learning workspace for ${language} at ${grade} grade level.`,
                });
                if (res?.work) {
                  onRefresh();
                  setActiveProject(res.work);
                  setActionMessage({ type: 'success', text: `Study project "${title}" created successfully!` });
                }
              } catch (e: any) {
                setActionMessage({ type: 'error', text: e.message || 'Failed to create study project.' });
              }
            }}
          />
        </div>
      )}

      {/* Main Layout: Projects Grid + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Projects list */}
        <div className="lg:col-span-2 space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-xs text-zinc-400">
              No work projects in this category. Click "New Work Project" to launch one!
            </div>
          ) : (
            filteredProjects.map((work) => {
              const isSelected = activeProject?.id === work.id;
              const isWebsite = work.category === 'Websites';

              return (
                <div
                  key={work.id}
                  onClick={() => setActiveProject(work)}
                  className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'border-zinc-900 ring-2 ring-zinc-900/10 shadow-md'
                      : 'border-zinc-200 hover:border-zinc-300 shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-zinc-900">
                          {work.title || work.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          {work.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700">
                          {work.status}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {isWebsite && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProject(work);
                              setInWebsiteBuilder(true);
                            }}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Launch Live Website Builder</span>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWork(work.id);
                          }}
                          className="p-1 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {work.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-3">
                      <span>Owner: <strong>{work.ownerName}</strong></span>
                      <span>•</span>
                      <span>{work.files?.length || 0} Files</span>
                      <span>•</span>
                      <span>{work.sharedWith?.length || 0} Collaborators</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-700">{work.progress || 0}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full"
                          style={{ width: `${work.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Active Work Project Inspector & AI Work Agent */}
        <div className="space-y-5">
          {activeProject ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    Active Project Inspector
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    ID: {activeProject.id.slice(0, 8)}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900">
                  {activeProject.title || activeProject.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">{activeProject.description}</p>
              </div>

              {activeProject.category === 'Study' && (
                <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-teal-50 border border-indigo-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-700" />
                      <span>Study & Education Hub</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900">
                      Interactive Learning
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900 leading-normal">
                    Study French, Mathematics, Arabic, and more with your AI tutor ready to solve equations, explain grammar, and translate.
                  </p>
                  
                  {/* Subject Quick Actions */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => setAiPrompt('Explique-moi les règles fondamentales de grammaire française et donne 3 exercices.')}
                      className="p-1.5 bg-white border border-indigo-200 hover:border-indigo-400 rounded-lg text-left shadow-2xs transition-colors"
                    >
                      <div className="text-[10px] font-bold text-indigo-950 flex items-center gap-1">
                        <span>🇫🇷 Français</span>
                      </div>
                      <div className="text-[9px] text-zinc-500">Grammaire & Dictée</div>
                    </button>

                    <button
                      onClick={() => setAiPrompt('Résous et explique étape par étape ce problème de mathématiques :')}
                      className="p-1.5 bg-white border border-indigo-200 hover:border-indigo-400 rounded-lg text-left shadow-2xs transition-colors"
                    >
                      <div className="text-[10px] font-bold text-indigo-950 flex items-center gap-1">
                        <span>📐 Math</span>
                      </div>
                      <div className="text-[9px] text-zinc-500">Algèbre & Calculs</div>
                    </button>

                    <button
                      onClick={() => setAiPrompt('اشرح لي قواعد النحو العربي الأساسية مع أمثلة واضحة (Arabe) :')}
                      className="p-1.5 bg-white border border-indigo-200 hover:border-indigo-400 rounded-lg text-left shadow-2xs transition-colors"
                    >
                      <div className="text-[10px] font-bold text-indigo-950 flex items-center gap-1">
                        <span>🇸🇦 Arabe</span>
                      </div>
                      <div className="text-[9px] text-zinc-500">النحو والمفردات</div>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowStudyHubModal(true)}
                    className="w-full mt-2 py-2 px-3 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Open Full Language & Grade Study Hub</span>
                  </button>
                </div>
              )}

              {activeProject.category === 'Websites' && (
                <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-teal-700" />
                      <span>Live Website Builder Ready</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-200 text-teal-900">
                      Registered
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-800 leading-normal">
                    Interactive multi-section website with real-time responsive preview, typography customization, and AI Copilot.
                  </p>
                  <button
                    onClick={() => setInWebsiteBuilder(true)}
                    className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>Open Live Website Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Attachments Section */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900">Attached Deliverables</h4>
                  <span className="text-[10px] text-zinc-400">
                    {activeProject.files?.length || 0} Files
                  </span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {activeProject.files && activeProject.files.length > 0 ? (
                    activeProject.files.map((file: any) => (
                      <div
                        key={file.id}
                        className="p-2 bg-zinc-50 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate text-zinc-800">{file.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {Math.round(file.sizeBytes / 1024)} KB
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No files attached yet.</p>
                  )}
                </div>

                {/* Upload Form */}
                <form onSubmit={handleAddFile} className="flex gap-2">
                  <input
                    type="text"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    placeholder="e.g. spec-v1.json, index.html"
                    className="flex-1 px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={!uploadFileName.trim() || loadingAction}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Attach</span>
                  </button>
                </form>
              </div>

              {/* Share Collaborator Section */}
              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-900">Share Access</h4>
                  <span className="text-[10px] text-zinc-400">
                    {activeProject.sharedWith?.length || 0} Collaborators
                  </span>
                </div>

                <form onSubmit={handleShareWork} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUsername}
                      onChange={(e) => setShareUsername(e.target.value)}
                      placeholder="Colleague username (e.g. alex_dev)"
                      className="flex-1 px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-900 focus:outline-hidden"
                    />
                    <select
                      value={sharePermission}
                      onChange={(e) => setSharePermission(e.target.value as any)}
                      className="px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium"
                    >
                      <option value="VIEW">View</option>
                      <option value="EDIT">Edit</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={!shareUsername.trim() || loadingAction}
                    className="w-full py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>Grant Project Access</span>
                  </button>
                </form>
              </div>

              {/* AI Work Agent Copilot Box */}
              <div className="pt-3 border-t border-zinc-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-teal-600" />
                    <h4 className="text-xs font-bold text-zinc-900">AI Work Agent</h4>
                  </div>
                  <span className="text-[10px] text-teal-600 font-semibold">Gemini 3.8 Flash</span>
                </div>

                <div className="h-44 overflow-y-auto p-3 bg-zinc-50 rounded-xl space-y-2.5 text-xs border border-zinc-200/80">
                  {aiChatHistory.length === 0 ? (
                    <div className="text-zinc-400 text-center py-6 text-xs">
                      Ask the AI Agent for guidance, architecture proposals, or code reviews for "{activeProject.title || activeProject.name}".
                    </div>
                  ) : (
                    aiChatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl leading-relaxed whitespace-pre-line ${
                          msg.sender === 'USER'
                            ? 'bg-zinc-900 text-white ml-6'
                            : 'bg-white border border-zinc-200 text-zinc-800 mr-4'
                        }`}
                      >
                        <div className="font-bold text-[10px] opacity-70 mb-0.5">
                          {msg.sender === 'USER' ? 'You' : 'AI Work Agent'}
                        </div>
                        <div>{msg.text}</div>
                      </div>
                    ))
                  )}
                  {aiLoading && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500 p-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                      <span>Work Agent thinking...</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAskAgent} className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask agent for next steps or feedback..."
                    className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!aiPrompt.trim() || aiLoading}
                    className="p-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-xs text-zinc-400">
              Select a work project to inspect deliverables and consult the AI Work Agent.
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-zinc-900 mb-1">New WORK Project</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Select from 16 categories (including Study for French, Math, Arabic) to launch your project workspace.
            </p>

            <form onSubmit={handleCreateProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. CloudScale Marketing Landing Page"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as WorkCategory)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden"
                >
                  {WORK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Deliverable Summary
                </label>
                <textarea
                  rows={2}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Summary of goals and expected outcomes"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Initial Notes / Specs
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Requirements, links, technical parameters"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Launch Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Study Hub Full Modal */}
      {showStudyHubModal && (
        <div
          onClick={() => setShowStudyHubModal(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-700" />
                <h3 className="text-base font-bold text-zinc-900">Language & Grade Study Hub</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStudyHubModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <LanguageStudyHub
              onSaveAsProject={async ({ title, language, grade }) => {
                setShowStudyHubModal(false);
                try {
                  const res = await api.createWork({
                    title: `${title} (${language} - ${grade})`,
                    category: 'Study',
                    description: `Interactive language learning workspace for ${language} at ${grade} grade level.`,
                  });
                  if (res?.work) {
                    onRefresh();
                    setActiveProject(res.work);
                    setActionMessage({ type: 'success', text: `Study project "${title}" created!` });
                  }
                } catch (e: any) {
                  setActionMessage({ type: 'error', text: e.message || 'Failed to create study project.' });
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
