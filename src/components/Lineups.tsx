import React, { useState, useMemo, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useLineups } from '../hooks/useLineups';
import LineupCard from './LineupCard';
import { Users2, Info, Search, X } from 'lucide-react';
import { PlayerWithStats } from '../hooks/useSupabase';

const Lineups: React.FC = () => {
  const [showTopLineups, setShowTopLineups] = useState(true);
  const { players, loading: playersLoading } = useSupabase();
  const { lineups: allLineups, loading: lineupsLoading } = useLineups(showTopLineups, players);
  const loading = playersLoading || lineupsLoading;

  const [activeSection, setActiveSection] = useState<'two' | 'three' | 'five'>('two');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerWithStats[]>([]);
  const [searchResults, setSearchResults] = useState<PlayerWithStats[]>([]);

  // Filter players based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filteredPlayers = players.filter(player => 
      player.PLAYER_NAME.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedPlayers.some(selected => selected.PLAYER_NAME === player.PLAYER_NAME)
    );
    
    setSearchResults(filteredPlayers.slice(0, 5));
  }, [searchQuery, players, selectedPlayers]);

  // Filter lineups based on selected players
  const lineups = useMemo(() => {
    if (!allLineups) return { twoMan: [], threeMan: [], fiveMan: [] };
    
    const filterLineupsByPlayers = (lineupList: any[]) => {
      if (selectedPlayers.length === 0) return lineupList;
      
      return lineupList.filter(lineup => {
        // Check if all selected players are in this lineup
        return selectedPlayers.every(player => {
          const lastName = player.PLAYER_NAME.split(' ').pop() || '';
          return lineup.players.some((lineupPlayer: {name: string; image_url: string | null}) => 
            lineupPlayer.name && lineupPlayer.name.includes(lastName)
          );
        });
      });
    };
    
    const sortLineups = (lineupList: any[]) => {
      return [...lineupList].sort((a, b) => 
        showTopLineups ? b.net_rating - a.net_rating : a.net_rating - b.net_rating
      );
    };
    
    return {
      twoMan: sortLineups(filterLineupsByPlayers(allLineups.twoMan)),
      threeMan: sortLineups(filterLineupsByPlayers(allLineups.threeMan)),
      fiveMan: sortLineups(filterLineupsByPlayers(allLineups.fiveMan)),
    };
  }, [allLineups, showTopLineups, selectedPlayers]);

  const handleAddPlayer = (player: PlayerWithStats) => {
    if (selectedPlayers.length < 5) {
      setSelectedPlayers([...selectedPlayers, player]);
      setSearchQuery('');
    }
  };

  const handleRemovePlayer = (playerToRemove: PlayerWithStats) => {
    setSelectedPlayers(selectedPlayers.filter(
      player => player.PLAYER_NAME !== playerToRemove.PLAYER_NAME
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Users2 className="w-12 h-12 text-[#78BE20] animate-pulse mx-auto" />
          <p className="text-gray-400">Loading lineups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1e2129]/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/50 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Lineup Analysis</h2>
            <p className="text-gray-400 text-sm">Explore the performance of different Timberwolves lineup combinations</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTopLineups(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                showTopLineups
                  ? 'bg-[#78BE20] text-white shadow-lg shadow-[#78BE20]/20'
                  : 'bg-[#141923] text-gray-400 hover:bg-[#1e2129]'
              }`}
            >
              Top Lineups
            </button>
            <button
              onClick={() => setShowTopLineups(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                !showTopLineups
                  ? 'bg-[#DC2626] text-white shadow-lg shadow-[#DC2626]/20'
                  : 'bg-[#141923] text-gray-400 hover:bg-[#1e2129]'
              }`}
            >
              Bottom Lineups
            </button>
          </div>
        </div>

        {/* Player Search Section */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for players to filter lineups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-[#141923] border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#78BE20] focus:border-transparent text-white"
              disabled={selectedPlayers.length >= 5}
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-[#141923] rounded-lg shadow-lg border border-gray-700/50 max-h-60 overflow-auto">
                {searchResults.map((player) => (
                  <div
                    key={player.PLAYER_NAME}
                    className="px-4 py-2 hover:bg-[#1e2129] cursor-pointer flex items-center gap-2 text-white"
                    onClick={() => handleAddPlayer(player)}
                  >
                    {player.image_url ? (
                      <img src={player.image_url} alt={player.PLAYER_NAME} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1e2129] flex items-center justify-center">
                        <Users2 className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <span>{player.PLAYER_NAME}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedPlayers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedPlayers.map((player) => (
                <div
                  key={player.PLAYER_NAME}
                  className="flex items-center gap-1 bg-[#78BE20] text-white px-3 py-1 rounded-full text-sm"
                >
                  {player.PLAYER_NAME}
                  <button
                    onClick={() => handleRemovePlayer(player)}
                    className="ml-1 text-white hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {selectedPlayers.length > 0 && (
                <button
                  onClick={() => setSelectedPlayers([])}
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveSection('two')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeSection === 'two'
                ? 'bg-[#78BE20] text-white'
                : 'bg-[#141923] text-gray-400 hover:bg-[#1e2129]'
            }`}
          >
            2-Man Lineups
          </button>
          <button
            onClick={() => setActiveSection('three')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeSection === 'three'
                ? 'bg-[#78BE20] text-white'
                : 'bg-[#141923] text-gray-400 hover:bg-[#1e2129]'
            }`}
          >
            3-Man Lineups
          </button>
          <button
            onClick={() => setActiveSection('five')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeSection === 'five'
                ? 'bg-[#78BE20] text-white'
                : 'bg-[#141923] text-gray-400 hover:bg-[#1e2129]'
            }`}
          >
            5-Man Lineups
          </button>
        </div>

        <div className="relative">
          <div className={`transition-all duration-500 ${activeSection === 'two' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lineups.twoMan.length > 0 ? (
                lineups.twoMan.map((lineup, index) => (
                  <LineupCard key={index} lineup={lineup} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-400">
                  No lineups found with the selected players.
                </div>
              )}
            </div>
          </div>

          <div className={`transition-all duration-500 ${activeSection === 'three' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lineups.threeMan.length > 0 ? (
                lineups.threeMan.map((lineup, index) => (
                  <LineupCard key={index} lineup={lineup} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-400">
                  No lineups found with the selected players.
                </div>
              )}
            </div>
          </div>

          <div className={`transition-all duration-500 ${activeSection === 'five' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {lineups.fiveMan.length > 0 ? (
                lineups.fiveMan.map((lineup, index) => (
                  <LineupCard key={index} lineup={lineup} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-400">
                  No lineups found with the selected players.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-gray-400 bg-[#141923]/60 rounded-lg p-3">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>Minimum 50 minutes played together required for inclusion</span>
        </div>
      </div>
    </div>
  );
};

export default Lineups;