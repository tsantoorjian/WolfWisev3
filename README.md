# WolfWise v3

WolfWise is a modern web application built with React, TypeScript, and Vite that provides analytical insights into all things Minnesota Timberwolves.

## Pages and Features

### Live Game Stats
- Real-time game statistics and updates
- Live tracking of player performance during games
- Dynamic updates for ongoing matches

### Player Stats
- Comprehensive player statistics and analytics
- Individual player performance metrics
- Last 5 and last 10 game performance tracking
- Interactive player selection with profile images
- Detailed statistical breakdowns

### Lineups
- Analysis of different lineup combinations
- Toggle between top and bottom performing lineups
- View 2-man, 3-man, and 5-man lineup configurations
- Performance metrics for each lineup combination
- Interactive lineup selection and filtering

### League Leaders
- Track team and league-wide statistical leaders
- Compare player performances across different categories
- Real-time updates of league standings and statistics

### Record Tracker
- Track progress towards NBA milestones
- Monitor player achievements and records
- Visual progress indicators and projections
- Track multiple statistical categories:
  - Points, Assists, Rebounds
  - Steals, Blocks, Turnovers
  - Field Goals, Three-Pointers, Free Throws

### Statistical Distributions
- Visual representation of statistical distributions
- Compare player performances across different metrics
- Interactive charts and data visualization
- Customizable statistical views and filters

## Tech Features

- Interactive charts using ECharts and Chart.js
- Modern, responsive UI
- TypeScript for enhanced type safety
- Supabase integration for data management
- React Query for efficient data fetching and caching

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Data Visualization**: ECharts & Chart.js
- **Data Management**: Supabase
- **State Management**: React Query
- **Routing**: React Router DOM

## Data Collection & ETL

The application uses a suite of Python scripts for data extraction, transformation, and loading (ETL). Dependencies managed via dedicated requirements.txt. These scripts are organized in the `src/_python_scripts` directory and include:

### Data Sources
- **NBA Official API**: Real-time game data, player statistics, and official league data
- **Basketball Reference**: Historical statistics, advanced metrics, and player/team records
- **ESPN API**: Supplementary game data and real-time updates
- **NBA.com**: Team logos, player images, and other media assets

### Data Collection Components
- **Player Game Logs**: Scripts for gathering and processing individual player game statistics
- **Lineup Analysis**: Tools for collecting and analyzing different lineup combinations
- **In-Game Stats**: Real-time game statistics collection and processing
- **League Leaders**: Scripts to track and update league-wide statistical leaders
- **Record Tracking**: Automated collection of milestone and record progression
- **Statistical Distributions**: Data gathering for statistical analysis and visualization
- **NBA Assets**: Includes logo scraping functionality for team branding

### Data Pipeline Architecture
- **Azure Functions**: Automated script execution triggered by Minnesota Timberwolves game schedule
  - Pre-game data collection and preparation
  - In-game real-time updates
  - Post-game statistics processing
- **Supabase Database**: 
  - Central data storage for all collected statistics
  - Real-time database updates via Supabase's PostgreSQL instance
  - Efficient data querying through PostgREST API
  - Row Level Security (RLS) for data access control

## License

This project is private and not licensed for public use.

## Contact

Tony Santoorjian - [GitHub](https://github.com/tsantoorjian)
