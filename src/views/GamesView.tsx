import React, { useEffect, useMemo, useState } from 'react';
import { Gamepad2, MessageCircle, RotateCcw, Send, Trophy, Users } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

type GameRoom = {
  id: string; gameType: 'TICTACTOE'; status: 'WAITING'|'ACTIVE'|'FINISHED';
  host: User; opponent: User; board: Array<string|null>; turnUserId: string;
  winnerUserId?: string|null; draw?: boolean; messages: Array<{id:string; userId:string; displayName:string; content:string; createdAt:string}>;
};

export const GamesView: React.FC<{currentUser: User; friends: User[]}> = ({ currentUser, friends }) => {
  const [game, setGame] = useState<GameRoom|null>(null);
  const [selectedFriend, setSelectedFriend] = useState(friends[0]?.id || '');
  const [inviteId, setInviteId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const opponent = useMemo(() => friends.find(f => f.id === selectedFriend), [friends, selectedFriend]);

  const loadGame = async (id:string) => {
    try { const r = await api.getGame(id); setGame(r.game); } catch (e:any) { setNotice(e.message || 'Game unavailable'); }
  };

  useEffect(() => {
    if (!game?.id) return;
    const timer = window.setInterval(() => loadGame(game.id), 1000);
    return () => window.clearInterval(timer);
  }, [game?.id]);

  useEffect(() => {
    const token = api.getToken();
    if (!token) return;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(proto + '//' + window.location.host + '/?token=' + encodeURIComponent(token));
    ws.onmessage = e => {
      try {
        const d = JSON.parse(e.data);
        if ((d.type === 'game:update' || d.type === 'game:invite') && d.gameId) {
          if (game?.id === d.gameId) loadGame(d.gameId);
          if (d.type === 'game:invite') setNotice('You received a game invitation. Enter the invite code below.');
        }
      } catch {}
    };
    return () => ws.close();
  }, [game?.id]);

  const createGame = async () => {
    if (!selectedFriend) return setNotice('Choose a friend first.');
    setLoading(true);
    try {
      const r = await api.createGame({ gameType:'TICTACTOE', opponentId:selectedFriend });
      setGame(r.game); setInviteId(r.game.id); setNotice('Game created. Your friend can join using the invite code.');
    } catch (e:any) { setNotice(e.message || 'Could not create game.'); } finally { setLoading(false); }
  };

  const joinGame = async () => {
    if (!inviteId.trim()) return;
    try { const r = await api.joinGame(inviteId.trim()); setGame(r.game); setNotice('Joined game.'); }
    catch(e:any) { setNotice(e.message || 'Could not join game.'); }
  };

  const move = async (index:number) => {
    if (!game || game.status !== 'ACTIVE' || game.turnUserId !== currentUser.id) return;
    try { const r = await api.gameMove(game.id, index); setGame(r.game); }
    catch(e:any) { setNotice(e.message || 'Move rejected.'); }
  };

  const sendGameMessage = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!game || !message.trim()) return;
    try { const r = await api.gameChat(game.id, message.trim()); setGame(r.game); setMessage(''); }
    catch(e:any) { setNotice(e.message || 'Message failed.'); }
  };

  const reset = () => { setGame(null); setNotice(''); setInviteId(''); };

  return <div className="space-y-6">
    <div>
      <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center"><Gamepad2 className="w-5 h-5"/></div><div><h1 className="text-2xl font-black">Games</h1><p className="text-sm text-zinc-500">Play with friends and chat while you play.</p></div></div>
    </div>
    {notice && <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">{notice}</div>}
    {!game ? <div className="grid md:grid-cols-2 gap-5">
      <section className="bg-white border border-zinc-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 font-bold"><Trophy className="w-4 h-4 text-teal-600"/> Start Tic-Tac-Toe</div>
        <p className="text-sm text-zinc-500 mt-1 mb-4">Invite a friend to an online X/O match.</p>
        <label className="text-xs font-semibold text-zinc-500">Friend</label>
        <select value={selectedFriend} onChange={e=>setSelectedFriend(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 p-3 text-sm">
          <option value="">Select a friend</option>{friends.map(f=><option key={f.id} value={f.id}>{f.displayName} (@{f.username})</option>)}
        </select>
        <button disabled={loading || !selectedFriend} onClick={createGame} className="mt-3 w-full rounded-xl bg-zinc-900 text-white p-3 text-sm font-bold disabled:opacity-40">{loading?'Creating…':'Create Game'}</button>
      </section>
      <section className="bg-white border border-zinc-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 font-bold"><Users className="w-4 h-4"/> Join a Game</div>
        <p className="text-sm text-zinc-500 mt-1 mb-4">Paste the game code your friend shared.</p>
        <input value={inviteId} onChange={e=>setInviteId(e.target.value)} placeholder="Game code" className="w-full rounded-xl border border-zinc-200 p-3 text-sm"/>
        <button onClick={joinGame} className="mt-3 w-full rounded-xl bg-teal-600 text-white p-3 text-sm font-bold">Join Game</button>
      </section>
    </div> :
    <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-5">
      <section className="bg-white border border-zinc-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5"><div><div className="font-black">Tic-Tac-Toe</div><div className="text-xs text-zinc-500">{game.host.displayName} vs {game.opponent.displayName}</div></div><button onClick={reset} className="text-xs px-3 py-2 rounded-lg border border-zinc-200 flex items-center gap-1"><RotateCcw className="w-3 h-3"/> Leave</button></div>
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-2">
          {game.board.map((cell,i)=><button key={i} onClick={()=>move(i)} disabled={!!cell || game.status!=='ACTIVE' || game.turnUserId!==currentUser.id} className="aspect-square rounded-2xl border-2 border-zinc-200 bg-zinc-50 hover:bg-zinc-100 disabled:opacity-70 text-5xl font-black">{cell}</button>)}
        </div>
        <div className="text-center mt-4 text-sm font-semibold">{game.status==='FINISHED' ? (game.draw ? 'Draw!' : game.winnerUserId===currentUser.id ? 'You won!' : 'Your friend won!') : game.turnUserId===currentUser.id ? 'Your turn' : 'Friend’s turn'}</div>
      </section>
      <section className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col min-h-[420px]">
        <div className="font-bold flex items-center gap-2 pb-3 border-b"><MessageCircle className="w-4 h-4"/> Game chat</div>
        <div className="flex-1 overflow-y-auto py-3 space-y-2">{game.messages.map(m=><div key={m.id} className="text-sm"><span className="font-bold">{m.userId===currentUser.id?'You':m.displayName}: </span>{m.content}</div>)}</div>
        <form onSubmit={sendGameMessage} className="flex gap-2"><input value={message} onChange={e=>setMessage(e.target.value)} placeholder="Message your friend…" className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm"/><button className="rounded-xl bg-zinc-900 text-white p-2.5"><Send className="w-4 h-4"/></button></form>
      </section>
    </div>}
  </div>;
};
