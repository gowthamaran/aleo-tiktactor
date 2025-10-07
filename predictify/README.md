# 🧠 Predictify - Prediction Training Simulator

A modern web application that lets users practice prediction markets with fake money, track their accuracy, and compete on leaderboards. Built with Next.js, TypeScript, and Supabase.

![Predictify Screenshot](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Predictify+Prediction+Training+Simulator)

## ✨ Features

### 🎯 Core Functionality
- **Fake-Money Prediction Game**: Place bets on various prediction markets using virtual currency
- **Market Management**: Browse and filter active markets by category
- **Real-time Betting Interface**: Intuitive betting system with sliders and quick bet amounts
- **Market Resolution**: Admin panel for resolving markets and distributing winnings

### 📊 User Analytics
- **Personal Stats Dashboard**: Track accuracy, winnings, streaks, and betting history
- **Performance Charts**: Visualize accuracy trends and category breakdowns
- **Badge System**: Earn achievements for various milestones
- **Leaderboard**: Compete with other users and track rankings

### 🎮 Gamification
- **Streak Tracking**: Monitor consecutive correct predictions
- **Achievement Badges**: Unlock rewards for different accomplishments
- **Leaderboard Rankings**: See how you stack up against other predictors
- **Category Specialization**: Track performance across different market types

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd predictify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `database/schema.sql`
   - Get your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
predictify/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── admin/             # Admin panel
│   │   ├── stats/             # User stats page
│   │   └── leaderboard/       # Leaderboard page
│   ├── components/            # React components
│   │   ├── Navbar.tsx         # Navigation component
│   │   ├── MarketCard.tsx     # Market display component
│   │   └── BettingInterface.tsx # Betting modal
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/                   # Utility functions
│   │   ├── supabase.ts        # Supabase client
│   │   └── utils.ts           # Helper functions
│   └── types/                 # TypeScript type definitions
│       └── index.ts           # Core types
├── database/
│   └── schema.sql             # Database schema
└── README.md
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **profiles**: User profiles with stats and balance
- **markets**: Prediction markets with outcomes and odds
- **bets**: User bets with resolution tracking
- **badges**: Achievement system
- **user_badges**: User badge assignments
- **prediction_insights**: AI-generated insights
- **weekly_challenges**: Special events

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Betting
- `POST /api/bets` - Place a new bet
- `GET /api/bets` - Get user's betting history

### Markets
- `POST /api/markets/resolve` - Resolve a market (admin only)

## 🎨 Key Components

### MarketCard
Displays market information with betting interface and real-time odds.

### BettingInterface
Modal component for placing bets with amount selection and payout calculation.

### Stats Dashboard
Comprehensive analytics with charts showing accuracy trends and performance metrics.

### Leaderboard
Rankings system with user stats and achievement tracking.

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔐 Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For production
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🎯 Usage

### For Users
1. **Sign up** for a new account (starts with $1,000 fake money)
2. **Browse markets** and filter by category
3. **Place bets** on your predictions
4. **Track performance** in the stats dashboard
5. **Compete** on the leaderboard

### For Admins
1. **Access admin panel** at `/admin`
2. **Resolve markets** when outcomes are determined
3. **Monitor** user activity and market performance

## 🎨 Customization

### Adding New Market Categories
1. Update the `MarketCategory` type in `src/types/index.ts`
2. Add category colors in `src/lib/utils.ts`
3. Update the category filter in the main page

### Creating New Badges
1. Add badge data to the database
2. Update the badge display logic in stats components
3. Implement badge earning conditions

### Styling
The app uses Tailwind CSS for styling. Customize the design by:
- Modifying color schemes in `tailwind.config.js`
- Updating component styles
- Adding custom CSS classes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Recharts](https://recharts.org/) for data visualization

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

---

**Happy Predicting! 🎯**