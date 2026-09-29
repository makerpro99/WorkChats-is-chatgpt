import React, { useState } from 'react';
import { Users2, Plus, UserPlus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Team, User } from '../types';
import { api } from '../api';

interface TeamsViewProps {
  teams: Team[];
  currentUser: User;
  onRefreshTeams: () => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  teams,
  currentUser,
  onRefreshTeams,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState<Team | null>(null);

  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [memberUsername, setMemberUsername] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createTeam(teamName, teamDescription);
      setSuccess('Team created successfully!');
      setTeamName('');
      setTeamDescription('');
      onRefreshTeams();
      setTimeout(() => {
        setShowCreateModal(false);
        setSuccess(null);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to create team.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddMemberModal) return;
    setLoading(true);
    setError(null);
    try {
      await api.addTeamMember(showAddMemberModal.id, memberUsername);
      setSuccess(`Added @${memberUsername} to team!`);
      setMemberUsername('');
      onRefreshTeams();
      setTimeout(() => {
        setShowAddMemberModal(null);
        setSuccess(null);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Teams & Groups</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organize work, share projects, and collaborate with dedicated teammates.
          </p>
        </div>

        <button
          id="btn-create-team"
          onClick={() => {
            setError(null);
            setSuccess(null);
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map((team) => (
          <div
            key={team.id}
            className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Users2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                  {team.members.length} members
                </span>
              </div>

              <h3 className="text-sm font-bold text-zinc-900 mb-1">{team.name}</h3>
              <p className="text-xs text-zinc-500 line-clamp-2 mb-4 leading-relaxed">
                {team.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-[11px] text-zinc-400">Created by {team.createdByName}</span>
              <button
                onClick={() => {
                  setError(null);
                  setSuccess(null);
                  setShowAddMemberModal(team);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-zinc-900 mb-1">Create New Team</h3>
            <p className="text-xs text-zinc-500 mb-4">Set up a workspace channel for your group.</p>

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Design Systems, Platform Engineering"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="What is this team focusing on?"
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
                  disabled={loading}
                  className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              Add Member to {showAddMemberModal.name}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">Enter a registered username.</p>

            {error && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={memberUsername}
                  onChange={(e) => setMemberUsername(e.target.value)}
                  placeholder="e.g. alex_dev"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(null)}
                  className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
