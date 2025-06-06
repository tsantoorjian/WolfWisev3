import React, { useState, useMemo, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useLineups } from '../hooks/useLineups';
import LineupCard from './LineupCard';
import { Users2, Info, Search, X, TrendingUp, TrendingDown } from 'lucide-react';
import { PlayerWithStats } from '../hooks/useSupabase';

const Lineups: React.FC = () => {
  const [showTopLineups, setShowTopLineups] = useState(true);
  const { players, loading: playersLoading } = useSupabase();
  const { lineups: allLineups, loading: lineupsLoading } = useLineups(showTopLineups, players);
  const loading = playersLoading || lineupsLoading;

  const [activeSection, setActiveSection] = useState<'two' | 'three' | 'five'>('five');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerWithStats[]>([]);
  const [searchResults, setSearchResults] = useState<PlayerWithStats[]>([]);
  
  // Add specialized filter type
  type FilterType = 'net' | 'offense' | 'defense' | 'shooting' | 'pace' | 'minutes';
  const [activeFilter, setActiveFilter] = useState<FilterType>('net');

  // Filter options
  const lineupSizeOptions = [
    { value: 'five', label: '5-Man Lineups' },
    { value: 'three', label: '3-Man Lineups' },
    { value: 'two', label: '2-Man Lineups' },
  ];

  const specializationOptions = [
    { value: 'net', label: 'Best Rating', description: 'Shows lineups with the best overall net rating (offensive rating minus defensive rating)' },
    { value: 'offense', label: 'Offensive Juggernaut', description: 'Shows lineups with the highest offensive rating (points scored per 100 possessions)' },
    { value: 'defense', label: 'Defensive Monsters', description: 'Shows lineups with the lowest defensive rating (points allowed per 100 possessions)' },
    { value: 'shooting', label: 'Sharp Shooters', description: 'Shows lineups with the highest true shooting percentage (accounts for 2PT, 3PT, and FT efficiency)' },
    { value: 'pace', label: 'Run And Gun', description: 'Shows lineups with the fastest pace (possessions per 48 minutes)' },
    { value: 'minutes', label: 'Most Played', description: 'Shows lineups with the most minutes played together on the court' },
  ];

  // Calculate max minutes for each lineup type
  const maxMinutes = useMemo(() => {
    if (!allLineups) return 50;
    
    const getMaxMinutes = (lineups: any[]) => {
      return Math.max(...lineups.map(l => l.min), 50);
    };

    switch (activeSection) {
      case 'two':
        return getMaxMinutes(allLineups.twoMan);
      case 'three':
        return getMaxMinutes(allLineups.threeMan);
      case 'five':
        return getMaxMinutes(allLineups.fiveMan);
      default:
        return 50;
    }
  }, [allLineups, activeSection]);

  // Set default minimum minutes to 25% of max minutes for the active section
  const [minMinutes, setMinMinutes] = useState(5);
  useEffect(() => {
    if (allLineups) {
      const defaultMinutes = Math.max(5, Math.round(maxMinutes * 0.10));
      setMinMinutes(defaultMinutes);
    }
  }, [maxMinutes, allLineups, activeSection]);

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

  // Filter lineups based on selected players and minimum minutes
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
    
    const filterByMinutes = (lineupList: any[]) => {
      return lineupList.filter(lineup => lineup.min >= minMinutes);
    };
    
    const sortLineups = (lineupList: any[]) => {
      // Apply specialized sorting based on filter type
      return [...lineupList].sort((a, b) => {
        switch (activeFilter) {
          case 'offense':
            return showTopLineups ? b.off_rating - a.off_rating : a.off_rating - b.off_rating;
          case 'defense':
            // For defense, lower is better so we invert the comparison
            return showTopLineups ? a.def_rating - b.def_rating : b.def_rating - a.def_rating;
          case 'shooting':
            return showTopLineups ? b.ts_pct - a.ts_pct : a.ts_pct - b.ts_pct;
          case 'pace':
            return showTopLineups ? b.pace - a.pace : a.pace - b.pace;
          case 'minutes':
            return showTopLineups ? b.min - a.min : a.min - b.min;
          case 'net':
          default:
            return showTopLineups ? b.net_rating - a.net_rating : a.net_rating - b.net_rating;
        }
      });
    };
    
    return {
      twoMan: sortLineups(filterByMinutes(filterLineupsByPlayers(allLineups.twoMan))),
      threeMan: sortLineups(filterByMinutes(filterLineupsByPlayers(allLineups.threeMan))),
      fiveMan: sortLineups(filterByMinutes(filterLineupsByPlayers(allLineups.fiveMan))),
    };
  }, [allLineups, showTopLineups, selectedPlayers, minMinutes, activeFilter]);

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
    <div className="bg-[#0d1117] p-4 rounded-xl shadow-md">
      <div className="space-y-6">
        <div className="bg-[#1e2129]/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/50 p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Lineup Analysis</h2>
              <p className="text-gray-400 text-sm">Explore the performance of different Timberwolves lineup combinations</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            <div className="flex flex-wrap gap-4">
              {/* Lineup Size Dropdown */}
              <div className="flex-1 min-w-[200px]">
                <div className="text-gray-400 text-sm mb-2">Lineup Size:</div>
                <select
                  value={activeSection}
                  onChange={(e) => setActiveSection(e.target.value as 'two' | 'three' | 'five')}
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-[#141923] text-white border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-[#78BE20] focus:border-transparent hover:bg-[#1e2129] transition-colors"
                >
                  {lineupSizeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialization Dropdown */}
              <div className="flex-1 min-w-[200px]">
                <div className="text-gray-400 text-sm mb-2">Lineup Specialization:</div>
                <select
                  value={activeFilter}
                  onChange={(e) => {
                    setActiveFilter(e.target.value as FilterType);
                    setShowTopLineups(true);
                  }}
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-[#141923] text-white border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-[#78BE20] focus:border-transparent hover:bg-[#1e2129] transition-colors"
                >
                  {specializationOptions.map(option => (
                    <option key={option.value} value={option.value} title={option.description}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-[#141923] rounded-lg p-3 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-gray-400 text-sm">Minimum Minutes Played:</div>
                <div className="text-[#78BE20] font-medium">{minMinutes.toLocaleString()}</div>
              </div>
              <input
                type="range"
                min="0"
                max={maxMinutes}
                value={minMinutes}
                onChange={(e) => setMinMinutes(Number(e.target.value))}
                className="w-full h-2 bg-[#1e2129] rounded-lg appearance-none cursor-pointer accent-[#78BE20]"
              />
            </div>

            {/* Player Search Section */}
            <div>
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
                        className="px-4 py-2.5 hover:bg-[#1e2129] cursor-pointer flex items-center gap-3 text-white transition-all duration-200"
                        onClick={() => handleAddPlayer(player)}
                      >
                        {player.image_url ? (
                          <img src={player.image_url} alt={player.PLAYER_NAME} className="w-8 h-8 rounded-full object-cover border border-gray-700/60" />
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
                <div className="mt-2 flex flex-wrap gap-2">
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
          </div>
        </div>

        <div className="relative min-h-[200px]">
          {activeSection === 'two' && (
            <div className="flex flex-col gap-4">
              {lineups.twoMan.length > 0 ? (
                lineups.twoMan.map((lineup, index) => (
                  <LineupCard key={index} lineup={lineup} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No lineups found with the selected players and minutes filter.
                </div>
              )}
            </div>
          )}

          {activeSection === 'three' && (
            <div className="flex flex-col gap-4">
              {lineups.threeMan.length > 0 ? (
                lineups.threeMan.map((lineup, index) => (
                  <LineupCard key={index} lineup={lineup} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No lineups found with the selected players and minutes filter.
                </div>
              )}
            </div>
          )}

          {activeSection === 'five' && (
            <div className="flex flex-col gap-4">
              {lineups.fiveMan.length > 0 ? (
                lineups.fiveMan.map((lineup, index) => (
                  <LineupCard key={index} lineup={lineup} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No lineups found with the selected players and minutes filter.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-gray-400 bg-[#141923]/60 rounded-lg p-3">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>Showing lineups with {minMinutes}+ minutes played together</span>
        </div>
      </div>
    </div>
  );
};

export default Lineups;