import React, { useState, useEffect, memo } from 'react';
import { 
  Home, 
  DollarSign, 
  Users, 
  Calendar, 
  MapPin, 
  Navigation,
  Menu,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

// Shadcn/ui components (simulated)
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "default", size = "default", className = "", onClick, disabled = false }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "underline-offset-4 hover:underline text-primary"
  };
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = memo(({ className = "", value, onChange, placeholder, id, autoComplete }) => (
  <input 
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    id={id}
    autoComplete={autoComplete}
  />
));

const Label = ({ children, htmlFor, className = "" }) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium text-gray-700 mb-2 block ${className}`}>
    {children}
  </label>
);

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-slate-900 text-white",
    secondary: "bg-slate-100 text-slate-900",
    success: "bg-green-500 text-white",
    warning: "bg-orange-500 text-white",
    destructive: "bg-red-500 text-white"
  };
  
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const Table = ({ children, className = "" }) => (
  <div className="w-full overflow-auto">
    <table className={`w-full caption-bottom text-sm ${className}`}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead className="border-b bg-slate-50">
    {children}
  </thead>
);

const TableBody = ({ children }) => (
  <tbody className="[&_tr:last-child]:border-0">
    {children}
  </tbody>
);

const TableRow = ({ children, className = "" }) => (
  <tr className={`border-b transition-colors hover:bg-muted/50 ${className}`}>
    {children}
  </tr>
);

const TableHead = ({ children, className = "" }) => (
  <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground ${className}`}>
    {children}
  </th>
);

const TableCell = ({ children, className = "" }) => (
  <td className={`p-4 align-middle ${className}`}>
    {children}
  </td>
);


type User = {
  name: string;
  id: string;
  verified: boolean;
  created_at: string;
};

const HomePage = ({ 
  isSubmissionAllowed, 
  timeUntilNext, 
  name, 
  id, 
  handleNameChange, 
  handleIdChange, 
  handleSubmit, 
  loading, 
  registeredUsers 
}) => (
  <div className="space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
      <div className="mx-auto sm:mx-0">
        <h1 className="text-3xl font-bold text-slate-900">Football Registration</h1>
        <p className="mt-1 text-slate-600">Register for upcoming matches</p>
      </div>
      {!isSubmissionAllowed && (
        <div className="mt-4 sm:mt-0">
          <div className="modern-badge-warning">
            <Clock className="h-3 w-3 mr-1" />
            Next registration: {timeUntilNext}
          </div>
        </div>
      )}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Register Now</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="id">Intra Login</Label>
              <Input
                id="id"
                value={id}
                onChange={handleIdChange}
                placeholder="Enter your intra login"
                autoComplete="username"
              />
            </div>
            
            <Button 
              onClick={handleSubmit}
              className="w-full mt-6" 
              disabled={loading || !isSubmissionAllowed}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Late Fees</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Not ready when booking starts</TableCell>
                <TableCell className="text-right font-medium">5 AED</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cancel reservation</TableCell>
                <TableCell className="text-right font-medium">5 AED</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Late &gt; 15 minutes</TableCell>
                <TableCell className="text-right font-medium">15 AED</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Cancel on game day after 5 PM</TableCell>
                <TableCell className="text-right font-medium">15 AED</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>No Show without notice</TableCell>
                <TableCell className="text-right font-medium">30 AED</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Player List</h2>
          <Badge variant="secondary" className="modern-badge">{registeredUsers.length} registered</Badge>
        </div>
        <p className="text-sm text-slate-600">Orange indicates waitlist position</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading players...</div>
        ) : registeredUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-medium">Dare to be First</p>
          </div>
        ) : (
          <div className="space-y-2">
            {registeredUsers.map((user, index) => (
              <div 
                key={user.id}
                className={`player-item ${index < 16 ? 'confirmed' : 'waitlist'}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`player-number ${index < 16 ? 'confirmed' : 'waitlist'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-600">{user.intra}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.verified ? (
                    <div className="badge badge-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  ) : (
                    <div className="badge badge-destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Invalid Intra
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

const FootballApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [registeredUsers, setRegisteredUsers] =  useState<User[]>([]);
  const [moneyData, setMoneyData] = useState([] as { date: string; name: string; intra: string; amount: number; paid?: boolean }[]);
  const [bannedUsers, setBannedUsers] = useState([] as { id: string; name: string; reason: string; banned_at: string; banned_until: string }[]);
  const [loading, setLoading] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState("2h 30m 15s");
  const [isSubmissionAllowed, setIsSubmissionAllowed] = useState(true);
  
  
  useEffect (() => {
	  fetch("/api/users")
		  .then(response => response.json())
		  .then(data => {
			  console.log("Fetched users:", data);
			  setRegisteredUsers(data);
		  })
		  .catch(error => {
			  console.error("Error fetching users:", error);
			  setRegisteredUsers([]);
		  });
  }, []);

  // money data
  useEffect(() => {
	const fetchMoneyData = async () => {
	  try {
		const response = await fetch('/api/moneyDb');
		if (!response.ok) throw new Error('Network response was not ok');
		const data = await response.json();
		setMoneyData(data);
	  } catch (error) {
		console.error('Error fetching money data:', error);
		setMoneyData([]);
	  }
	};
	fetchMoneyData();
  }, []);

  // banned users
  useEffect(() => {
	const fetchBannedUsers = async () => {
		try {
			const response = await fetch('/api/banned-users');
			if (!response.ok) throw new Error('Network response was not ok');
			const data = await response.json();
			setBannedUsers(data);
		} catch (error) {
			console.error('Error fetching banned users:', error);
			setBannedUsers([]);
		}
	};
	fetchBannedUsers();
  }, []);

  // Close popup after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'money', label: 'Money', icon: DollarSign },
    { id: 'players', label: 'Players', icon: Users },
	{ id: 'banned', label: 'Banned', icon: AlertCircle },
  ];

  const externalLinks = [
    { label: 'Location', icon: MapPin, url: 'https://maps.app.goo.gl/Xem3GbnvzNjhheD37' },
    { label: 'Directions', icon: Navigation, url: 'https://maps.app.goo.gl/iEZR2Fia2xf4cdQ87' },
  ];

  const handleSubmit = () => {
    // Your existing form submission logic here
    console.log('Form submitted:', { name, id });
    setName("");
    setId("");
  };

  const Sidebar = () => (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="flex items-center justify-between h-16 px-6 border-b bg-white">
        <h1 className="text-xl font-bold text-slate-900">
          <span className="football-bounce">⚽</span> Football Club
        </h1>
        <Button 
          variant="ghost" 
          size="sm" 
          className="lg:hidden hover:bg-gray-100 text-gray-700"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <nav className="mt-8 bg-white h-full">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  // Don't auto-close sidebar on desktop
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`sidebar-button ${activeTab === item.id ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </div>
        
        <div className="mt-8 px-4">
          <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">External Links</h3>
          <div className="mt-2 space-y-1">
            {externalLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {link.label}
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );


  const MoneyPage = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-center sm:text-left">
        <div className="mx-auto sm:mx-0">
          <h1 className="text-3xl font-bold text-slate-900">Money Tracking</h1>
          <p className="mt-1 text-slate-600">Track payments and fees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {moneyData.filter(r => r.paid).reduce((acc, r) => acc + r.amount, 0)} AED
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Unpaid</p>
                <p className="text-2xl font-bold text-orange-600">
                  {moneyData.filter(r => !r.paid).reduce((acc, r) => acc + r.amount, 0)} AED
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  {moneyData.reduce((acc, r) => acc + r.amount, 0)} AED
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Payment Records</h2>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Intra Login</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {moneyData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Loading data...
                    </TableCell>
                  </TableRow>
                ) : (
                  moneyData.map((record, index) => (
                    <TableRow key={index} className={record.paid ? 'bg-green-50' : 'bg-orange-50'}>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>
                        <a 
                          href={`https://profile.intra.42.fr/users/${record.intra}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {record.intra}
                        </a>
                      </TableCell>
                      <TableCell className="font-medium">{record.amount} AED</TableCell>
                      <TableCell>
                        {record.paid ? (
                          <div className="badge badge-success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Paid
                          </div>
                        ) : (
                          <div className="badge badge-warning">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const PlayersPage = () => (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <div className="mx-auto sm:mx-0">
          <h1 className="text-3xl font-bold text-slate-900">Player Management</h1>
          <p className="mt-1 text-slate-600">Manage registered players</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Players</h2>
            <Badge variant="secondary" className="modern-badge">{registeredUsers.length} total</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {registeredUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.id}</p>
                    <p className="text-xs text-slate-500">
                      Registered: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.verified ? (
                    <div className="badge badge-success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  ) : (
                    <div className="badge badge-destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unverified
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );


    const isExpired = (bannedUntil: string) => {
    return new Date(bannedUntil) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const activeBans = bannedUsers.filter(user => !isExpired(user.banned_until));
  const expiredBans = bannedUsers.filter(user => isExpired(user.banned_until));

  const BannedPlayersPage = () => (
	<div className="space-y-6">
      <div className="text-center sm:text-left">
        <div className="mx-auto sm:mx-0">
          <h1 className="text-3xl font-bold text-slate-900">Banned Players</h1>
          <p className="mt-1 text-slate-600">List of Banned Players</p>
        </div>
      </div>
	  <Card>
		<CardHeader>
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Currently Banned Players</h2>
				<Badge variant="secondary" className="modern-badge">{activeBans.length} total</Badge>
			</div>
		</CardHeader>
		<CardContent>
			<div className="space-y-3">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>ID</th>
                          <th>Reason</th>
                          <th>Banned Date</th>
                          <th>Ban Expires</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeBans.map((user) => (
                          <tr key={user.id}>
                            <td>
                              {user.name}
                            </td>
                            <td>
                              {user.id}
                            </td>
                            <td>
                              {user.reason}
                            </td>
                            <td>
                              {formatDate(user.banned_at)}
                            </td>
                            <td>
                              <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                                {formatDate(user.banned_until)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
			</div>
		</CardContent>
	</Card>
	<Card>
		<CardHeader>
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold">Expired Bannes</h2>
				<Badge variant="secondary" className="modern-badge">{expiredBans.length} total</Badge>
			</div>
		</CardHeader>
		<CardContent>
			<div className="space-y-3">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>ID</th>
                          <th>Reason</th>
                          <th>Banned Date</th>
                          <th>Ban Expires</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiredBans.map((user) => (
                          <tr key={user.id}>
                            <td>
                              {user.name}
                            </td>
                            <td>
                              {user.id}
                            </td>
                            <td>
                              {user.reason}
                            </td>
                            <td>
                              {formatDate(user.banned_at)}
                            </td>
                            <td>
                              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                                {formatDate(user.banned_until)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
			</div>
		</CardContent>
	</Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage 
            isSubmissionAllowed={isSubmissionAllowed}
            timeUntilNext={timeUntilNext}
            name={name}
            id={id}
            handleNameChange={(e) => setName(e.target.value)}
            handleIdChange={(e) => setId(e.target.value)}
            handleSubmit={handleSubmit}
            loading={loading}
            registeredUsers={registeredUsers}
          />
        );
      case 'money':
        return <MoneyPage />;
      case 'players':
        return <PlayersPage />;
	  case 'banned':
		return <BannedPlayersPage />;
      default:
        return (
          <HomePage 
            isSubmissionAllowed={isSubmissionAllowed}
            timeUntilNext={timeUntilNext}
            name={name}
            id={id}
            handleNameChange={(e) => setName(e.target.value)}
            handleIdChange={(e) => setId(e.target.value)}
            handleSubmit={handleSubmit}
            loading={loading}
            registeredUsers={registeredUsers}
          />
        );
    }
  };

  return (
	<div className="football-app-container">
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      {/* Overlay for mobile only */}
      {sidebarOpen && (
        <div 
          className="overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content - will shift right when sidebar opens */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Desktop toggle button */}
        <div className="lg:block">
          <button 
            className="fixed top-4 z-50 bg-white border border-gray-200 rounded-md p-2 shadow-md hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            style={{ left: sidebarOpen ? '272px' : '16px' }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-16 bg-white border-b shadow-sm lg:hidden">
          <button 
            className="px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
          <div className="flex items-center px-4">
            <h1 className="text-lg font-semibold text-gray-900">
              <span className="football-bounce">⚽</span> Football Club
            </h1>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 pt-20 lg:pt-20">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white px-6 py-4 text-center text-sm text-slate-600">
          Built with ❤️ for 42 Football Club
        </footer>
      </div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <h2 className="text-xl font-bold">🚨 Back to Al Maryah Alert</h2>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p>Game @ Active Al Maryah. Check the location from the navigation menu.</p>
              <Button onClick={() => setShowPopup(false)} className="w-full">
                Got it!
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
	</div>
  );
};

export default FootballApp;
