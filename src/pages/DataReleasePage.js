import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Map,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Star,
  RefreshCw
} from 'lucide-react';

/**
Hello Xiang and Nisha,
This is currently hard coded with mock data.
Feel free to change the layout as you see fit.
 */

const DataReleasePage = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParallaxRange, setSelectedParallaxRange] = useState('all');
  const [selectedObsPhase, setSelectedObsPhase] = useState('all');
  const [selectedObsStatus, setSelectedObsStatus] = useState('all');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('ascending');
  const [activePulsar, setActivePulsar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for pulsars
  const [pulsars, setPulsars] = useState([]);
  const [error, setError] = useState(null);

  // Simulate loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('https://raw.githubusercontent.com/Lx1808/mspsrpi-website/Li_Dev/pulsars.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const data = await response.json();
        setPulsars(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching pulsar data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sorting function
  const requestSort = (column) => {
    let direction = 'ascending';
    if (sortColumn === column && sortDirection === 'ascending') {
      direction = 'descending';
    }
    setSortColumn(column);
    setSortDirection(direction);
  };

  const handleDownloadData = (pulsar, format) => {
    switch (format) {
      case 'json':
        const jsonStr = JSON.stringify(pulsar, null, 2);
        const jsonBlob = new Blob([jsonStr], { type: 'application/json' });
        downloadFile(jsonBlob, `${pulsar.name}-data.json`);
        break;

      case 'csv':
        const headers = Object.keys(pulsar).join(',');
        const values = Object.values(pulsar).map(v =>
          typeof v === 'string' ? `"${v}"` : v
        ).join(',');
        const csvContent = `${headers}\n${values}`;
        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        downloadFile(csvBlob, `${pulsar.name}-data.csv`);
        break;

      default:
        console.error('未知的下载格式');
    }
  };

  const downloadFile = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter and sort the pulsars
  const filteredAndSortedPulsars = useMemo(() => {
    return pulsars
      .filter(pulsar => {
        // Search filter
        const matchesSearch = pulsar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pulsar.ra.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pulsar.dec.toLowerCase().includes(searchQuery.toLowerCase());

        // Parallax filter
        const matchesParallax = selectedParallaxRange === 'all' ||
          (selectedParallaxRange === 'low' && pulsar.parallax < 0.8) ||
          (selectedParallaxRange === 'medium' && pulsar.parallax >= 0.8 && pulsar.parallax < 1.5) ||
          (selectedParallaxRange === 'high' && pulsar.parallax >= 1.5);

        // Observation phase filter
        const matchesPhase = selectedObsPhase === 'all' ||
          pulsar.phase === selectedObsPhase;

        // Observation status filter
        const matchesStatus = selectedObsStatus === 'all' ||
          pulsar.status === selectedObsStatus;

        return matchesSearch && matchesParallax && matchesPhase && matchesStatus;
      })
      .sort((a, b) => {
        // Handle sorting
        if (sortColumn === 'name') {
          return sortDirection === 'ascending'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        }
        if (sortColumn === 'parallax') {
          return sortDirection === 'ascending'
            ? a.parallax - b.parallax
            : b.parallax - a.parallax;
        }
        if (sortColumn === 'distance') {
          return sortDirection === 'ascending'
            ? a.distance - b.distance
            : b.distance - a.distance;
        }
        if (sortColumn === 'date') {
          const dateA = a.obsDate ? new Date(a.obsDate) : new Date(0);
          const dateB = b.obsDate ? new Date(b.obsDate) : new Date(0);
          return sortDirection === 'ascending'
            ? dateA - dateB
            : dateB - dateA;
        }
        return 0;
      });
  }, [pulsars, searchQuery, selectedParallaxRange, selectedObsPhase, selectedObsStatus, sortColumn, sortDirection]);

  // Selected pulsar data for the visualization
  const selectedPulsar = activePulsar
    ? pulsars.find(p => p.id === activePulsar)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-slate-900 to-black text-gray-100">
      {/* Navigation */}
      <nav className="bg-slate-900/90 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold">MSPSR<span className="text-indigo-400">π</span></Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-300 hover:text-indigo-400 px-3 py-2 font-medium">Home</Link>
              <Link to="/project" className="text-gray-300 hover:text-indigo-400 px-3 py-2 font-medium">Project</Link>
              <Link to="/data-release" className="text-indigo-400 px-3 py-2 font-medium">Data Release</Link>
              <Link to="/publications" className="text-gray-300 hover:text-indigo-400 px-3 py-2 font-medium">Publications</Link>
              <Link to="/team" className="text-gray-300 hover:text-indigo-400 px-3 py-2 font-medium">Team</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with starry background */}
      <div className="relative pt-16 pb-4">
        <div className="absolute inset-0 overflow-hidden">
          {/* Dark starry background with multiple star layers for depth */}
          <div className="w-full h-full bg-slate-950">
            {/* Large stars layer */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNiIvPjxjaXJjbGUgY3g9IjE3NSIgY3k9IjE1MCIgcj0iMS4yIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjciLz48Y2lyY2xlIGN4PSI3NSIgY3k9IjEwMCIgcj0iMSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC42Ii8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iMTUiIHI9IjEuNSIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC43Ii8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iNTAiIHI9IjEuMiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC42Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSIxNzUiIHI9IjEuNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC43Ii8+PGNpcmNsZSBjeD0iMTI1IiBjeT0iMTc1IiByPSIxIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYiLz48L3N2Zz4=')] opacity-50"></div>

            {/* Small stars layer */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjAuNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PGNpcmNsZSBjeD0iMzAiIGN5PSIxMCIgcj0iMC4zIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjQiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjIwIiByPSIwLjQiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjxjaXJjbGUgY3g9IjcwIiBjeT0iMTAiIHI9IjAuMyIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PGNpcmNsZSBjeD0iOTAiIGN5PSIzMCIgcj0iMC40IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjUiLz48Y2lyY2xlIGN4PSIxMCIgY3k9IjUwIiByPSIwLjQiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNCIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iNzAiIHI9IjAuMyIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PGNpcmNsZSBjeD0iNTAiIGN5PSI5MCIgcj0iMC40IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjQiLz48Y2lyY2xlIGN4PSI3MCIgY3k9IjUwIiByPSIwLjMiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjxjaXJjbGUgY3g9IjkwIiBjeT0iNzAiIHI9IjAuNCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PGNpcmNsZSBjeD0iMjAiIGN5PSIzMCIgcj0iMC4zIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjUiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIwLjQiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNCIvPjxjaXJjbGUgY3g9IjYwIiBjeT0iMzAiIHI9IjAuMyIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PGNpcmNsZSBjeD0iODAiIGN5PSI0MCIgcj0iMC40IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjQiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjgwIiByPSIwLjQiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNCIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iNjAiIHI9IjAuMyIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC41Ii8+PGNpcmNsZSBjeD0iNjAiIGN5PSI4MCIgcj0iMC40IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjQiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjYwIiByPSIwLjMiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')] opacity-60"></div>

            {/* Subtle blue glow effect for nebula-like impression */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/10 to-transparent"></div>

            {/* Darker gradient overlay at the edges */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 opacity-40"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-white mb-4">Pulsar Data Release</h1>
            <p className="text-xl text-indigo-200 mb-4">
              Explore our catalog of millisecond pulsar astrometric measurements
            </p>
            <p className="text-gray-300 mb-2">
              This catalog includes parallax and proper motion measurements for pulsars observed
              across all phases of the MSPSRπ program. Data is continuously updated as new observations
              are processed.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Catalog Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-white">Pulsar Catalog</h2>
            <p className="text-indigo-300">
              {isLoading
                ? 'Loading data...'
                : `${filteredAndSortedPulsars.length} pulsars found`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="#visualization" className="inline-flex items-center px-4 py-2 border border-cyan-500/30 rounded-md text-cyan-300 bg-slate-900/60 hover:bg-slate-800/80 transition duration-300">
              <Map className="mr-2 h-4 w-4" />
              View Visualizations
            </Link>
            <a href="/downloads/mspsrpi-data.zip" className="inline-flex items-center px-4 py-2 border border-indigo-500/30 rounded-md text-indigo-300 bg-slate-900/60 hover:bg-slate-800/80 transition duration-300">
              <Download className="mr-2 h-4 w-4" />
              Download Dataset
            </a>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-lg p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-cyan-500/70" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-700/80 rounded-md leading-5 bg-slate-800/60 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30"
                placeholder="Search pulsar name or coordinates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Parallax Filter */}
              <div className="relative inline-block text-left">
                <select
                  className="block w-full py-2 pl-3 pr-10 border border-slate-700/80 rounded-md leading-5 bg-slate-800/60 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30"
                  value={selectedParallaxRange}
                  onChange={(e) => setSelectedParallaxRange(e.target.value)}
                >
                  <option value="all">All Parallaxes</option>
                  <option value="low">Low (&lt; 0.8 mas)</option>
                  <option value="medium">Medium (0.8-1.5 mas)</option>
                  <option value="high">High (&gt; 1.5 mas)</option>
                </select>
              </div>

              {/* Observation Phase Filter */}
              <div className="relative inline-block text-left">
                <select
                  className="block w-full py-2 pl-3 pr-10 border border-slate-700/80 rounded-md leading-5 bg-slate-800/60 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30"
                  value={selectedObsPhase}
                  onChange={(e) => setSelectedObsPhase(e.target.value)}
                >
                  <option value="all">All Phases</option>
                  <option value="PSRPI">PSRPI</option>
                  <option value="MSPSRPI">MSPSRPI</option>
                  <option value="MSPSRPI2">MSPSRPI2</option>
                </select>
              </div>

              {/* Observation Status Filter */}
              <div className="relative inline-block text-left">
                <select
                  className="block w-full py-2 pl-3 pr-10 border border-slate-700/80 rounded-md leading-5 bg-slate-800/60 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30"
                  value={selectedObsStatus}
                  onChange={(e) => setSelectedObsStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="complete">Complete</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="issue">Issues</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pulsar Table */}
        <div className="overflow-x-auto bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 rounded-lg shadow-xl mb-10">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-indigo-300">Loading pulsar data...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-400 mb-4">Error loading data: {error}</p>
              <p className="text-gray-400 mb-4">Unable to fetch pulsar data from GitHub repository.</p>
            </div>
          ) : filteredAndSortedPulsars.length > 0 ? (
            <table className="min-w-full divide-y divide-slate-800/80">
              <thead className="bg-slate-800/60">
                <tr>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                    onClick={() => requestSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Pulsar Name</span>
                      {sortColumn === 'name' && (
                        <span className="ml-1">
                          {sortDirection === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">
                    <div className="flex items-center">
                      <span>Coordinates</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                    onClick={() => requestSort('parallax')}
                  >
                    <div className="flex items-center">
                      <span>Parallax (mas)</span>
                      {sortColumn === 'parallax' && (
                        <span className="ml-1">
                          {sortDirection === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                    onClick={() => requestSort('distance')}
                  >
                    <div className="flex items-center">
                      <span>Distance (kpc)</span>
                      {sortColumn === 'distance' && (
                        <span className="ml-1">
                          {sortDirection === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider">
                    <div className="flex items-center">
                      <span>Phase</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium text-indigo-300 uppercase tracking-wider"
                    onClick={() => requestSort('date')}
                  >
                    <div className="flex items-center">
                      <span>Status</span>
                      {sortColumn === 'date' && (
                        <span className="ml-1">
                          {sortDirection === 'ascending' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAndSortedPulsars.map((pulsar) => (
                  <tr
                    key={pulsar.id}
                    className={`group hover:bg-slate-800/40 cursor-pointer ${activePulsar === pulsar.id ? 'bg-slate-800/60' : ''}`}
                    onClick={() => setActivePulsar(pulsar.id === activePulsar ? null : pulsar.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center">
                          {activePulsar === pulsar.id ? (
                            <Star className="h-5 w-5 text-cyan-400" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400/80 transition-colors"></div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-indigo-200 group-hover:text-indigo-100">{pulsar.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">RA: {pulsar.ra}</div>
                      <div className="text-sm text-gray-300">Dec: {pulsar.dec}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{pulsar.parallax.toFixed(2)} ± {pulsar.parallaxErr.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{pulsar.distance.toFixed(2)} ± {pulsar.distanceErr.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${pulsar.phase === 'PSRPI' ? 'bg-green-900/30 text-green-300 border border-green-500/30' :
                          pulsar.phase === 'MSPSRPI' ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30' :
                            'bg-blue-900/30 text-blue-300 border border-blue-500/30'}`}
                      >
                        {pulsar.phase}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pulsar.status === 'complete' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-500/30">
                          Complete
                        </span>
                      ) : pulsar.status === 'issue' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-fuchsia-900/30 text-fuchsia-300 border border-fuchsia-500/30">
                          Issue
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-300 border border-purple-500/30">
                          Scheduled
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-400">No pulsars match your search criteria.</p>
              <button
                className="mt-4 inline-flex items-center px-4 py-2 border border-cyan-500/30 rounded-md text-cyan-300 bg-slate-900/60 hover:bg-slate-800/80 transition duration-300"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedParallaxRange('all');
                  setSelectedObsPhase('all');
                  setSelectedObsStatus('all');
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Selected Pulsar Details - Only shown if a pulsar is selected */}
        {selectedPulsar && (
          <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-500/30 rounded-lg p-6 mb-10 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center">
                  {selectedPulsar.name}
                  <div className="ml-3 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${selectedPulsar.phase === 'PSRPI' ? 'bg-green-900/30 text-green-300 border border-green-500/30' :
                        selectedPulsar.phase === 'MSPSRPI' ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30' :
                          'bg-blue-900/30 text-blue-300 border border-blue-500/30'}`}
                    >
                      {selectedPulsar.phase}
                    </span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${selectedPulsar.status === 'complete' ? 'bg-green-900/30 text-green-300 border border-green-500/30' :
                        selectedPulsar.status === 'issue' ? 'bg-fuchsia-900/30 text-fuchsia-300 border border-fuchsia-500/30' :
                          'bg-purple-900/30 text-purple-300 border border-purple-500/30'}`}
                    >
                      {selectedPulsar.status === 'complete' ? 'Complete' :
                        selectedPulsar.status === 'issue' ? 'Issue' : 'Scheduled'}
                    </span>
                  </div>
                </h3>
                <p className="text-indigo-300 mt-1">Observed: {selectedPulsar.obsDate ? new Date(selectedPulsar.obsDate).toLocaleDateString() : 'Not yet observed'}</p>
              </div>
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setActivePulsar(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-indigo-200 font-semibold mb-3 text-lg">Astrometric Data</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-md p-3">
                    <p className="text-xs text-gray-400 uppercase">Right Ascension</p>
                    <p className="text-lg text-white">{selectedPulsar.ra}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-md p-3">
                    <p className="text-xs text-gray-400 uppercase">Declination</p>
                    <p className="text-lg text-white">{selectedPulsar.dec}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-md p-3">
                    <p className="text-xs text-gray-400 uppercase">Galactic Longitude</p>
                    <p className="text-lg text-white">{selectedPulsar.gLong.toFixed(1)}°</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-md p-3">
                    <p className="text-xs text-gray-400 uppercase">Galactic Latitude</p>
                    <p className="text-lg text-white">{selectedPulsar.gLat.toFixed(1)}°</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-md p-3">
                    <p className="text-xs text-gray-400 uppercase">Parallax</p>
                    <p className="text-lg text-white">{selectedPulsar.parallax.toFixed(2)} ± {selectedPulsar.parallaxErr.toFixed(2)} mas</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-md p-3">
                    <p className="text-xs text-gray-400 uppercase">Distance</p>
                    <p className="text-lg text-white">{selectedPulsar.distance.toFixed(2)} ± {selectedPulsar.distanceErr.toFixed(2)} kpc</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-md p-3 col-span-2">
                    <p className="text-xs text-gray-400 uppercase">Proper Motion</p>
                    <p className="text-lg text-white">{selectedPulsar.properMotion.toFixed(1)} ± {selectedPulsar.properMotionErr.toFixed(1)} mas/yr</p>
                  </div>
                </div>

                {selectedPulsar.notes && (
                  <div className="mt-4 bg-indigo-900/20 border border-indigo-500/30 rounded-md p-3">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-indigo-400 mr-2 mt-0.5" />
                      <p className="text-indigo-200">{selectedPulsar.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-indigo-200 font-semibold mb-3 text-lg">Positional Accuracy</h4>
                {/* Placeholder for position error ellipse visualization */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-md h-64 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="mx-auto h-32 w-32 text-indigo-300" viewBox="0 0 100 100">
                      {/* Coordinate grid */}
                      <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.5" />
                      <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="0.5" />

                      {/* Error ellipse */}
                      <ellipse
                        cx="50"
                        cy="50"
                        rx={selectedPulsar.parallaxErr * 10}
                        ry={selectedPulsar.properMotionErr * 2}
                        stroke="#9333ea"
                        strokeWidth="1"
                        fill="rgba(147, 51, 234, 0.2)"
                      />

                      {/* Center point representing the pulsar */}
                      <circle cx="50" cy="50" r="2" fill="#38bdf8" />
                    </svg>
                    <p className="text-gray-400 text-sm mt-2">Position error ellipse (not to scale)</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-indigo-200 font-semibold mb-3 text-lg">Data Access</h4>
                  <div className="space-y-3">
                    <a
                      href={`/downloads/pulsars/${selectedPulsar.name}.fits`}
                      className="flex items-center text-cyan-300 hover:text-cyan-200 transition"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download FITS Image
                    </a>

                    {/* Download JSON file */}
                    <button
                      onClick={() => handleDownloadData(selectedPulsar, 'json')}
                      className="flex items-center text-cyan-300 hover:text-cyan-200 transition"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download JSON file
                    </button>

                    {/* Download CSV file */}
                    <button
                      onClick={() => handleDownloadData(selectedPulsar, 'csv')}
                      className="flex items-center text-cyan-300 hover:text-cyan-200 transition"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV file
                    </button>
                    <a
                      href={`https://ui.adsabs.harvard.edu/search/q=${selectedPulsar.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-cyan-300 hover:text-cyan-200 transition"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Publications
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Visualization Section */}
        <div id="visualization" className="pt-6 mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Data Visualizations</h2>
            <p className="text-indigo-300">
              Interactive visualizations of MSPSRπ parallax and proper motion measurements
            </p>
          </div>

          {/* Visualization placeholder - would be replaced with actual interactive components */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold text-cyan-300 mb-3">Galactic Distribution</h3>
              <div className="h-80 bg-slate-800/50 rounded-md flex items-center justify-center">
                {/* Placeholder for Galactic distribution visualization */}
                <div className="text-center">
                  <svg className="mx-auto h-48 w-48 text-cyan-300" viewBox="0 0 400 400">
                    {/* Simple Galactic plane representation */}
                    <ellipse cx="200" cy="200" rx="150" ry="30" stroke="#0e7490" strokeWidth="1" fill="none" />

                    {/* Stylized spiral arms */}
                    <path d="M200,200 C240,180 270,140 290,90" stroke="#0e7490" strokeWidth="1" fill="none" />
                    <path d="M200,200 C160,180 130,140 110,90" stroke="#0e7490" strokeWidth="1" fill="none" />
                    <path d="M200,200 C240,220 270,260 290,310" stroke="#0e7490" strokeWidth="1" fill="none" />
                    <path d="M200,200 C160,220 130,260 110,310" stroke="#0e7490" strokeWidth="1" fill="none" />

                    {/* Galactic center */}
                    <circle cx="200" cy="200" r="8" fill="#0e7490" />

                    {/* Sample pulsars */}
                    <circle cx="180" cy="170" r="3" fill="#0ea5e9" />
                    <circle cx="220" cy="190" r="3" fill="#0ea5e9" />
                    <circle cx="170" cy="220" r="3" fill="#0ea5e9" />
                    <circle cx="240" cy="160" r="3" fill="#0ea5e9" />
                    <circle cx="160" cy="230" r="3" fill="#0ea5e9" />
                    <circle cx="210" cy="240" r="3" fill="#0ea5e9" />
                    <circle cx="250" cy="210" r="3" fill="#0ea5e9" />
                    <circle cx="150" cy="190" r="3" fill="#0ea5e9" />
                    <circle cx="230" cy="140" r="3" fill="#0ea5e9" />
                    <circle cx="170" cy="250" r="3" fill="#0ea5e9" />
                  </svg>
                  <p className="text-gray-400 text-sm mt-2">Galactic distribution of observed pulsars</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-500/30 rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold text-indigo-300 mb-3">Parallax vs. Proper Motion</h3>
              <div className="h-80 bg-slate-800/50 rounded-md flex items-center justify-center">
                {/* Placeholder for scatter plot */}
                <div className="text-center">
                  <svg className="mx-auto h-48 w-48 text-indigo-300" viewBox="0 0 400 400">
                    {/* Axes */}
                    <line x1="50" y1="350" x2="350" y2="350" stroke="#6366f1" strokeWidth="2" />
                    <line x1="50" y1="350" x2="50" y2="50" stroke="#6366f1" strokeWidth="2" />

                    {/* Axis labels */}
                    <text x="200" y="380" textAnchor="middle" fill="#6366f1" fontSize="12">Parallax (mas)</text>
                    <text x="30" y="200" textAnchor="middle" fill="#6366f1" fontSize="12" transform="rotate(-90, 20, 200)">Proper Motion (mas/yr)</text>

                    {/* Data points */}
                    <circle cx="100" cy="300" r="4" fill="#818cf8" />
                    <circle cx="150" cy="250" r="4" fill="#818cf8" />
                    <circle cx="120" cy="280" r="4" fill="#818cf8" />
                    <circle cx="200" cy="200" r="4" fill="#818cf8" />
                    <circle cx="250" cy="150" r="4" fill="#818cf8" />
                    <circle cx="180" cy="220" r="4" fill="#818cf8" />
                    <circle cx="220" cy="180" r="4" fill="#818cf8" />
                    <circle cx="140" cy="260" r="4" fill="#818cf8" />
                    <circle cx="280" cy="120" r="4" fill="#818cf8" />
                    <circle cx="300" cy="100" r="4" fill="#818cf8" />
                  </svg>
                  <p className="text-gray-400 text-sm mt-2">Correlation between parallax and proper motion</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <a href="/visualizations" className="inline-flex items-center px-5 py-3 border border-cyan-500/40 rounded-md text-cyan-300 bg-slate-900/60 hover:bg-slate-800/80 transition duration-300">
              View Full Interactive Visualizations <ChevronRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Data Releases Section */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Data Releases</h2>
            <p className="text-indigo-300">
              Download complete datasets from each project phase
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 backdrop-blur-sm border border-green-500/30 rounded-lg p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-green-300 mb-2">PSRPI Data Release 1.0</h3>
              <p className="text-gray-300 mb-4">
                Original pulsar parallax data from 2011-2013 observations of 60 pulsars.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Released: May 2014</span>
                <a href="/downloads/psrpi-v1.0.zip" className="inline-flex items-center px-3 py-1.5 border border-green-500/30 rounded-md text-green-300 text-sm bg-slate-900/60 hover:bg-slate-800/80 transition duration-300">
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </a>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/30 rounded-lg p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">MSPSRPI Data Release 2.0</h3>
              <p className="text-gray-300 mb-4">
                Millisecond pulsar data from 2015-2018 observations of 18 millisecond pulsars.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Released: December 2019</span>
                <a href="/downloads/mspsrpi-v2.0.zip" className="inline-flex items-center px-3 py-1.5 border border-purple-500/30 rounded-md text-purple-300 text-sm bg-slate-900/60 hover:bg-slate-800/80 transition duration-300">
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </a>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-sm border border-blue-500/30 rounded-lg p-5 shadow-lg">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">MSPSRPI2 Initial Data</h3>
              <p className="text-gray-300 mb-4">
                Preliminary data from Phase 2 observations (27 of 44 targets completed).
              </p>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Updated: March 2025</span>
                <a href="/downloads/mspsrpi2-initial.zip" className="inline-flex items-center px-3 py-1.5 border border-blue-500/30 rounded-md text-blue-300 text-sm bg-slate-900/60 hover:bg-slate-800/80 transition duration-300">
                  <Download className="mr-1 h-4 w-4" />
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 border-t border-slate-800/50 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2025 Pulsar Astrometry Research Initiative. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataReleasePage;